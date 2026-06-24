import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Seed ghi nhiều bản ghi → dùng session pooler (DIRECT_URL) cho ổn định.
const pool = new Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PRODUCT_IMG = '/images/default-product.svg';
const ARTICLE_IMG = '/images/default-article.svg';
const BANNER_IMG = '/images/about.svg';

async function main() {
  console.log('Seeding…');

  // ── Settings ────────────────────────────────────────────────────────────
  await (prisma.setting as any).upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      data: {
        companyName: 'Công Ty CP Công Nghệ Sinh Học Thú Y',
        addressHN: 'Cụm CN Liên Phương, Xã Hồng Vân, Hà Nội',
        addressHCM: '',
        hotline1: '024 6686 1629',
        hotline2: '097 499 9204',
        email: 'pkd.binovet@gmail.com',
        intro_slogan: 'Công nghệ USA - Chất lượng vượt trội',
        social: {
          facebook: 'https://www.facebook.com/BiotechVietNam1',
          youtube: 'https://www.youtube.com/@Biotech-VET',
          zalo: '0974999204',
        },
        support: {
          doctorName: 'Ths.Bs Phùng Thanh Sơn',
          doctorEmail: 'thanhson256@gmail.com',
          doctorPhone: '0984 051 978',
        },
      },
    },
  });

  // ── Nav menus — mirrors the sanfovet.com structure ───────────────────────
  // Top-level header items are lean (Home · About · Products · Know-How ·
  // Gallery · News · Contact); About / Know-How / News carry dropdowns.
  await prisma.navMenu.deleteMany({});

  const mk = (data: any) =>
    prisma.navMenu.create({ data: { position: 'both', status: true, ...data } });
  const child = (parentId: bigint, data: any) =>
    prisma.navMenu.create({ data: { position: 'header', status: true, parent: parentId, ...data } });

  await mk({ name: 'Trang chủ', nameEn: 'Home', link: '/', order: 1 });
  const about = await mk({ name: 'Giới thiệu', nameEn: 'About Us', link: '/gioi-thieu', order: 2 });
  await mk({ name: 'Sản phẩm', nameEn: 'Products', link: '/san-pham', order: 3, hasMega: true });
  await mk({ name: 'Cẩm nang', nameEn: 'Know-How', link: '/cam-nang-chan-nuoi', order: 4 });
  await mk({ name: 'Thư viện ảnh', nameEn: 'Slide Gallery', link: '/thu-vien', order: 5 });
  const news = await mk({ name: 'Tin tức', nameEn: 'News', link: '/tin-tuc', order: 6 });
  await mk({ name: 'Liên hệ', nameEn: 'Contact', link: '/lien-he', order: 7, isButton: true });

  // About Us submenu → drives the tabs on /gioi-thieu
  await child(about.id, { name: 'Nghiên cứu & Phát triển', nameEn: 'Research & Development', link: '/gioi-thieu?tab=lich-su', order: 1 });
  await child(about.id, { name: 'Tầm nhìn & Sứ mệnh', nameEn: 'Mission & Vision', link: '/gioi-thieu?tab=tam-nhin', order: 2 });
  await child(about.id, { name: 'Cơ sở vật chất', nameEn: 'Our Facilities', link: '/gioi-thieu?tab=co-so', order: 3 });
  await child(about.id, { name: 'Hồ sơ năng lực', nameEn: 'Corporation Profile', link: '/gioi-thieu?tab=co-cau', order: 4 });

  // Know-How submenu is rendered dynamically: the header fetches the animal-tags
  // list and maps each tag to /cam-nang-chan-nuoi/{slug}, so no child rows here.

  // News submenu
  await child(news.id, { name: 'Tin nội bộ', nameEn: 'Corporate News', link: '/tin-tuc-noi-bo', order: 1 });
  await child(news.id, { name: 'Tin ngành chăn nuôi', nameEn: 'Industry News', link: '/tin-tuc-nganh-chan-nuoi-thu-y', order: 2 });

  // ── Categories — the 9 sanfovet product lines ────────────────────────────
  await prisma.category.deleteMany({});
  // Labels mirror the sanfovet PRODUCTS dropdown (same order).
  const categories = [
    { name: 'Bột & cốm hòa tan đường uống', nameEn: 'Oral soluble powder / granules', slug: 'thuoc-bot-com-uong' },
    { name: 'Dung dịch uống', nameEn: 'Oral solution', slug: 'dung-dich-uong' },
    { name: 'Thức ăn bổ sung / Phụ gia', nameEn: 'Feed supplements / additives', slug: 'bo-sung-dinh-duong' },
    { name: 'Thuốc tiêm (dung dịch / hỗn dịch)', nameEn: 'Injectable solution / suspension', slug: 'thuoc-tiem' },
    { name: 'Premix', nameEn: 'Premix', slug: 'premix' },
    { name: 'Trị cầu trùng / Ký sinh trùng', nameEn: 'Anticoccidial / Anthelmintic', slug: 'tri-cau-trung-ky-sinh-trung' },
    { name: 'Thẩm thấu / Sát trùng / Xua côn trùng', nameEn: 'Transdermal / Antiseptic / Bugs-repellent', slug: 'sat-trung-xua-con-trung' },
    { name: 'Sản phẩm theo yêu cầu', nameEn: 'Customized products', slug: 'san-pham-theo-yeu-cau' },
    { name: 'Thú cưng', nameEn: 'Pets', slug: 'thu-cung' },
  ];
  const catIds: Record<string, bigint> = {};
  for (const c of categories) {
    const row = await prisma.category.create({ data: c });
    catIds[c.slug] = row.id;
  }

  // ── Products (bilingual, spread across the categories) ────────────────────
  // Sample spec sections (Vietnamese) — update real content in the admin.
  const sampleSpec = (name: string) => [
    { title: 'Thành phần', content: `Mỗi đơn vị ${name} chứa các hoạt chất chính theo công thức tiêu chuẩn GMP-WHO của BINOVET. (Thông tin mẫu — cập nhật trong trang quản trị.)` },
    { title: 'Công dụng', content: 'Hỗ trợ phòng và điều trị theo chỉ định, nâng cao sức khỏe, sức đề kháng và năng suất cho vật nuôi.' },
    { title: 'Cách dùng & liều lượng', content: 'Sử dụng theo hướng dẫn của bác sĩ thú y. Pha hoặc trộn theo tỉ lệ khuyến cáo ghi trên bao bì.' },
    { title: 'Bảo quản', content: 'Nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp. Để xa tầm tay trẻ em.' },
  ];

  const sampleSpecEn = (name: string) => [
    { title: 'Composition', content: `Each unit of ${name} contains the main active ingredients per BINOVET's GMP-WHO standard formula. (Sample content — update in the admin panel.)` },
    { title: 'Indications', content: 'Supports prevention and treatment as directed, improving the health, immunity and productivity of livestock.' },
    { title: 'Dosage & administration', content: 'Use as directed by a veterinarian. Mix or blend at the recommended ratio printed on the packaging.' },
    { title: 'Storage', content: 'Store in a cool, dry place away from direct sunlight. Keep out of reach of children.' },
  ];

  const products = [
    { slug: 'bio-amoxicillin-50', name: 'BIO-AMOXICILLIN 50%', category: 'thuoc-bot-com-uong', featured: true,
      description: 'Kháng sinh phổ rộng đặc trị các bệnh nhiễm khuẩn đường hô hấp và tiêu hóa trên heo và gia cầm.',
      descriptionEn: 'A broad-spectrum antibiotic for respiratory and digestive bacterial infections in swine and poultry.', registrationNumber: 'BTV-001' },
    { slug: 'bio-doxy-50', name: 'BIO-DOXY 50%', category: 'thuoc-bot-com-uong', featured: false,
      description: 'Doxycycline dạng bột tan đặc trị các bệnh hô hấp phức hợp (CRD, ORT) trên gia cầm.',
      descriptionEn: 'Soluble doxycycline powder targeting complex respiratory diseases (CRD, ORT) in poultry.', registrationNumber: 'BTV-005' },
    { slug: 'bio-vitamin-c-oral', name: 'BIO-VITAMIN C ORAL', category: 'dung-dich-uong', featured: true,
      description: 'Dung dịch uống tăng cường sức đề kháng, hỗ trợ phục hồi sau bệnh.',
      descriptionEn: 'Oral solution that boosts immunity and supports recovery after illness.', registrationNumber: 'BTV-004' },
    { slug: 'bio-electrolyte-plus', name: 'BIO-ELECTROLYTE PLUS', category: 'bo-sung-dinh-duong', featured: true,
      description: 'Bổ sung chất điện giải, vitamin và khoáng chất giúp vật nuôi chống stress nhiệt.',
      descriptionEn: 'Supplies electrolytes, vitamins and minerals to help livestock cope with heat stress.', registrationNumber: 'BTV-003' },
    { slug: 'bio-min-plus', name: 'BIO-MIN PLUS', category: 'bo-sung-dinh-duong', featured: false,
      description: 'Bổ sung khoáng vi lượng hữu cơ và acid amin, kích thích tăng trọng.',
      descriptionEn: 'Organic trace minerals and amino acids supplement that promotes weight gain.', registrationNumber: 'BTV-006' },
    { slug: 'bio-tylosin-inj', name: 'BIO-TYLOSIN INJ', category: 'thuoc-tiem', featured: true,
      description: 'Dung dịch tiêm điều trị viêm phổi, viêm khớp và các bệnh do Mycoplasma.',
      descriptionEn: 'Injectable solution for pneumonia, arthritis and Mycoplasma-related diseases.', registrationNumber: 'BTV-002' },
    { slug: 'bio-gentadox-inj', name: 'BIO-GENTADOX INJ', category: 'thuoc-tiem', featured: false,
      description: 'Hỗn dịch tiêm kết hợp đặc trị nhiễm khuẩn kế phát trên heo.',
      descriptionEn: 'Combination injectable suspension for secondary bacterial infections in swine.', registrationNumber: 'BTV-007' },
    { slug: 'bio-premix-grow', name: 'BIO-PREMIX GROW', category: 'premix', featured: true,
      description: 'Premix vitamin – khoáng trộn thức ăn cho heo thịt giai đoạn sinh trưởng.',
      descriptionEn: 'Vitamin–mineral feed premix for growing finisher pigs.', registrationNumber: 'BTV-008' },
    { slug: 'bio-coxistop', name: 'BIO-COXISTOP', category: 'tri-cau-trung-ky-sinh-trung', featured: true,
      description: 'Đặc trị cầu trùng (Eimeria) trên gà và thỏ, phục hồi nhanh niêm mạc ruột.',
      descriptionEn: 'Targets coccidiosis (Eimeria) in chickens and rabbits, restoring intestinal mucosa quickly.', registrationNumber: 'BTV-009' },
    { slug: 'bio-iodine-200', name: 'BIO-IODINE 200', category: 'sat-trung-xua-con-trung', featured: false,
      description: 'Dung dịch sát trùng chuồng trại phổ rộng, an toàn khi có vật nuôi.',
      descriptionEn: 'Broad-spectrum farm disinfectant, safe to use in the presence of animals.', registrationNumber: 'BTV-010' },
    { slug: 'bio-custom-mix', name: 'BIO CUSTOM-MIX', category: 'san-pham-theo-yeu-cau', featured: false,
      description: 'Sản phẩm pha chế theo công thức riêng của trang trại và nhà phân phối.',
      descriptionEn: 'Products formulated to the specific requirements of farms and distributors.', registrationNumber: 'BTV-011' },
    { slug: 'bio-pet-multivit', name: 'BIO-PET MULTIVIT', category: 'thu-cung', featured: true,
      description: 'Bổ sung vitamin tổng hợp cho chó mèo, hỗ trợ lông da và tiêu hóa.',
      descriptionEn: 'Multivitamin supplement for dogs and cats, supporting coat, skin and digestion.', registrationNumber: 'BTV-012' },
  ];
  for (const p of products) {
    const { category, ...rest } = p;
    const data = {
      ...rest,
      categoryId: catIds[category],
      image: PRODUCT_IMG,
      images: [PRODUCT_IMG],
      specifications: sampleSpec(p.name),
      specificationsEn: sampleSpecEn(p.name),
    };
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: data,
    });
  }

  // ── Animal tags ─────────────────────────────────────────────────────────
  const tags = [
    { name: 'Heo', nameEn: 'Swine', slug: 'heo', icon: '🐷', description: 'Bệnh và kỹ thuật chăn nuôi heo', descriptionEn: 'Swine diseases and husbandry techniques' },
    { name: 'Gia cầm', nameEn: 'Poultry', slug: 'gia-cam', icon: '🐔', description: 'Bệnh và kỹ thuật chăn nuôi gia cầm', descriptionEn: 'Poultry diseases and husbandry techniques' },
    { name: 'Trâu bò', nameEn: 'Cattle', slug: 'trau-bo', icon: '🐄', description: 'Bệnh và kỹ thuật chăn nuôi trâu bò', descriptionEn: 'Cattle diseases and husbandry techniques' },
  ];
  for (const t of tags) {
    await prisma.animalTag.upsert({ where: { slug: t.slug }, update: t, create: t });
  }

  // ── Articles (bilingual, across categories) ─────────────────────────────
  const articles = [
    {
      slug: 'phong-tri-dich-ta-heo-chau-phi',
      title: 'Phòng và kiểm soát dịch tả heo Châu Phi (ASF)',
      titleEn: 'Preventing and controlling African Swine Fever (ASF)',
      category: 'benh-dieu-tri',
      animalTag: 'heo',
      excerpt: 'Các biện pháp an toàn sinh học cốt lõi giúp trang trại phòng chống hiệu quả dịch tả heo Châu Phi.',
      excerptEn: 'Core biosecurity measures that help farms effectively prevent African Swine Fever.',
      content: '<p>Dịch tả heo Châu Phi là bệnh truyền nhiễm nguy hiểm. An toàn sinh học là chìa khóa: kiểm soát người và phương tiện ra vào, sát trùng định kỳ, và cách ly heo mới nhập đàn.</p>',
      contentEn: '<p>African Swine Fever is a dangerous infectious disease. Biosecurity is key: control people and vehicle access, disinfect regularly, and quarantine newly introduced pigs.</p>',
    },
    {
      slug: 'benh-cau-trung-tren-ga',
      title: 'Bệnh cầu trùng trên gà: nhận biết và điều trị',
      titleEn: 'Coccidiosis in chickens: recognition and treatment',
      category: 'benh-dieu-tri',
      animalTag: 'gia-cam',
      excerpt: 'Hướng dẫn nhận biết sớm và phác đồ điều trị bệnh cầu trùng giúp giảm thiệt hại đàn gà.',
      excerptEn: 'A guide to early recognition and treatment protocols for coccidiosis to reduce flock losses.',
      content: '<p>Bệnh cầu trùng do ký sinh trùng Eimeria gây ra, biểu hiện phân lẫn máu, gà ủ rũ. Sử dụng thuốc đặc trị kết hợp bổ sung vitamin K và điện giải.</p>',
      contentEn: '<p>Coccidiosis is caused by Eimeria parasites, presenting as bloody droppings and lethargy. Use targeted anticoccidials combined with vitamin K and electrolyte supplementation.</p>',
    },
    {
      slug: 'ky-thuat-uom-ga-con',
      title: 'Kỹ thuật úm gà con đúng cách',
      titleEn: 'Proper brooding techniques for chicks',
      category: 'cam-nang',
      animalTag: 'gia-cam',
      excerpt: 'Quản lý nhiệt độ, độ ẩm và mật độ chuồng úm để gà con phát triển khỏe mạnh.',
      excerptEn: 'Managing temperature, humidity and stocking density in the brooder for healthy chicks.',
      content: '<p>Giai đoạn úm quyết định sức khỏe cả vòng đời. Tuần đầu duy trì 32-34°C, giảm dần mỗi tuần. Đảm bảo nước sạch và thức ăn chất lượng.</p>',
      contentEn: '<p>The brooding stage shapes lifelong health. Keep 32-34°C in the first week, lowering weekly. Ensure clean water and quality feed.</p>',
    },
    {
      slug: 'binovet-mo-rong-nha-may',
      title: 'BINOVET khánh thành dây chuyền sản xuất mới',
      titleEn: 'BINOVET inaugurates a new production line',
      category: 'tin-noi-bo',
      excerpt: 'Đầu tư dây chuyền đạt chuẩn GMP-WHO nâng cao năng lực cung ứng dược thú y.',
      excerptEn: 'A GMP-WHO compliant line boosts our veterinary pharmaceutical supply capacity.',
      content: '<p>Dây chuyền mới ứng dụng công nghệ tự động hóa, nâng công suất gấp đôi và đảm bảo chất lượng đồng đều cho mọi lô sản phẩm.</p>',
      contentEn: '<p>The new line applies automation technology, doubling capacity and ensuring consistent quality across every batch.</p>',
    },
    {
      slug: 'thi-truong-chan-nuoi-2026',
      title: 'Triển vọng thị trường chăn nuôi năm 2026',
      titleEn: 'Outlook for the livestock market in 2026',
      category: 'tin-nganh',
      excerpt: 'Phân tích xu hướng giá và nhu cầu thị trường chăn nuôi trong năm tới.',
      excerptEn: 'An analysis of price trends and market demand in the livestock sector next year.',
      content: '<p>Giá heo hơi dự báo phục hồi, nhu cầu protein động vật tăng. Người chăn nuôi nên tối ưu chi phí thức ăn và tăng cường phòng bệnh.</p>',
      contentEn: '<p>Live hog prices are expected to recover as demand for animal protein rises. Farmers should optimize feed costs and strengthen disease prevention.</p>',
    },
    {
      slug: 'kiem-soat-doc-to-nam-moc',
      title: 'Kiểm soát độc tố nấm mốc trong thức ăn chăn nuôi',
      titleEn: 'Controlling mycotoxins in animal feed',
      category: 'tin-nganh',
      excerpt: 'Nguy cơ từ độc tố nấm mốc và giải pháp hấp phụ giúp bảo vệ sức khỏe đàn vật nuôi.',
      excerptEn: 'Risks from mycotoxins and binder solutions that protect herd health.',
      content: '<p>Độc tố nấm mốc gây giảm năng suất và suy giảm miễn dịch. Sử dụng chất hấp phụ độc tố và bảo quản nguyên liệu khô ráo là giải pháp then chốt.</p>',
      contentEn: '<p>Mycotoxins reduce productivity and impair immunity. Using toxin binders and storing raw materials dry are key solutions.</p>',
    },
    {
      slug: 'ky-thuat-nuoi-heo-nai-sinh-san',
      title: 'Kỹ thuật nuôi heo nái sinh sản đạt năng suất cao',
      titleEn: 'High-yield sow husbandry techniques',
      category: 'cam-nang',
      animalTag: 'heo',
      excerpt: 'Quản lý dinh dưỡng, phối giống và chăm sóc heo nái qua từng giai đoạn để tối ưu số con cai sữa.',
      excerptEn: 'Managing nutrition, breeding and sow care through each stage to maximise weaned piglets.',
      content: '<p>Heo nái cần khẩu phần và chăm sóc khác nhau theo giai đoạn hậu bị, mang thai và nuôi con. Theo dõi thể trạng, bổ sung khoáng – vitamin và đảm bảo chuồng mát giúp tăng số con cai sữa/nái/năm.</p>',
      contentEn: '<p>Sows need different diets and care during the gilt, gestation and lactation stages. Monitoring body condition, supplementing minerals and vitamins, and keeping barns cool increases weaned piglets per sow per year.</p>',
    },
    {
      slug: 'ky-thuat-vo-beo-bo-thit',
      title: 'Kỹ thuật vỗ béo bò thịt hiệu quả',
      titleEn: 'Effective beef cattle fattening techniques',
      category: 'cam-nang',
      animalTag: 'trau-bo',
      excerpt: 'Phối hợp khẩu phần tinh – thô và bổ sung vi khoáng giúp bò tăng trọng nhanh, thịt đạt chất lượng.',
      excerptEn: 'Balancing concentrate and roughage with trace-mineral supplements for fast, quality weight gain.',
      content: '<p>Giai đoạn vỗ béo nên tăng dần tỉ lệ thức ăn tinh, bổ sung men tiêu hóa và vi khoáng. Cung cấp đủ nước sạch và tẩy ký sinh trùng định kỳ để bò hấp thu tối đa.</p>',
      contentEn: '<p>During fattening, gradually raise the concentrate ratio and add digestive enzymes and trace minerals. Provide clean water and deworm regularly for maximum feed conversion.</p>',
    },
    {
      slug: 'phong-benh-tu-huyet-trung-trau-bo',
      title: 'Phòng bệnh tụ huyết trùng ở trâu bò',
      titleEn: 'Preventing haemorrhagic septicaemia in cattle',
      category: 'benh-dieu-tri',
      animalTag: 'trau-bo',
      excerpt: 'Nhận biết triệu chứng và lịch tiêm phòng giúp kiểm soát bệnh tụ huyết trùng trên đàn trâu bò.',
      excerptEn: 'Recognising symptoms and a vaccination schedule to control haemorrhagic septicaemia in herds.',
      content: '<p>Bệnh tụ huyết trùng diễn biến nhanh, gây sốt cao và sưng phù vùng hầu. Tiêm vắc-xin định kỳ trước mùa mưa, kết hợp kháng sinh đặc hiệu khi phát hiện sớm là biện pháp hiệu quả.</p>',
      contentEn: '<p>Haemorrhagic septicaemia progresses rapidly with high fever and throat swelling. Routine vaccination before the rainy season plus targeted antibiotics at early detection are effective measures.</p>',
    },
    {
      slug: 'quan-ly-dan-ga-de-trung',
      title: 'Quản lý đàn gà đẻ để tối ưu năng suất trứng',
      titleEn: 'Managing layer flocks to optimise egg output',
      category: 'cam-nang',
      animalTag: 'gia-cam',
      excerpt: 'Kiểm soát ánh sáng, dinh dưỡng canxi và mật độ nuôi để duy trì tỉ lệ đẻ cao và vỏ trứng chắc.',
      excerptEn: 'Controlling lighting, calcium nutrition and density to sustain high lay rate and strong shells.',
      content: '<p>Gà đẻ cần chương trình chiếu sáng ổn định 16 giờ/ngày, khẩu phần giàu canxi và mật độ hợp lý. Bổ sung vitamin D3 và khoáng giúp vỏ trứng chắc, giảm dập vỡ.</p>',
      contentEn: '<p>Layers need a stable 16-hour lighting program, a calcium-rich diet and appropriate density. Vitamin D3 and mineral supplements strengthen shells and reduce breakage.</p>',
    },
  ];
  for (const a of articles) {
    const data = {
      ...a,
      publishDate: '01/06/2026',
      thumbnail: ARTICLE_IMG,
      featured: true,
      isDraft: false,
    };
    await prisma.article.upsert({ where: { slug: a.slug }, update: data, create: data });
  }

  // ── Banners (hero slider — two slides, sanfovet-style) ───────────────────
  await prisma.banner.deleteMany({});
  await prisma.banner.createMany({
    data: [
      {
        image: BANNER_IMG,
        title: 'Công nghệ USA - Chất lượng vượt trội',
        titleEn: 'USA Technology - Superior Quality',
        link: '/san-pham',
        status: true,
        order: 1,
      },
      {
        image: BANNER_IMG,
        title: 'Thương hiệu dược thú y hàng đầu Việt Nam',
        titleEn: "Vietnam's leading veterinary medicine brand",
        link: '/gioi-thieu',
        status: true,
        order: 2,
      },
    ],
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
