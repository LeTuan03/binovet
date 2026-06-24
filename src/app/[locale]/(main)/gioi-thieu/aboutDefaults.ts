import { AboutPageContent } from '@/types';

export type AboutContentResolved = {
  gioiThieu: {
    title: string;
    paragraph1: string;
    paragraph2: string;
    stat1Number: string;
    stat1Label: string;
    stat2Number: string;
    stat2Label: string;
  };
  lichSu: {
    title: string;
    intro: string;
    timeline: { year: string; text: string }[];
  };
  tamNhin: {
    visionTitle: string;
    visionText: string;
    missionTitle: string;
    missionText: string;
    quoteText: string;
    quoteAuthor: string;
    quoteRole: string;
  };
  coSo: {
    title: string;
    intro: string;
    cardTitle: string;
    cardText: string;
    stats: { number: string; label: string }[];
  };
  coCau: {
    title: string;
    intro: string;
    roles: string[];
    quoteText: string;
  };
  thanhTuu: {
    title: string;
    heading: string;
    images: { url: string; title: string; subtitle: string }[];
  };
};

export const aboutDefaults: AboutContentResolved = {
  gioiThieu: {
    title: 'Tổng quan về BINOVET',
    paragraph1:
      'BINOVET là thương hiệu dược thú y thuộc Công Ty CP Công Nghệ Sinh Học Thú Y. Với hơn 20 năm phát triển, chúng tôi tự hào mang đến các giải pháp dược phẩm chất lượng cao, ứng dụng công nghệ hiện đại từ Hoa Kỳ.',
    paragraph2:
      'Chúng tôi hướng đến việc liên tục đổi mới, cải tiến chất lượng và dịch vụ, đáp ứng nhu cầu ngày càng cao của ngành chăn nuôi trong và ngoài nước.',
    stat1Number: '200+',
    stat1Label: 'Sản phẩm',
    stat2Number: '63',
    stat2Label: 'Tỉnh thành',
  },
  lichSu: {
    title: 'Lịch sử hình thành',
    intro:
      'Hành trình đầy tự hào của binovet trong suốt hơn hai thập kỷ cống hiến cho ngành chăn nuôi Việt Nam.',
    timeline: [
      {
        year: '2002',
        text: 'Công ty Cổ phần Công Nghệ Sinh Học Thú Y chính thức được thành lập, đặt nền móng cho sự ra đời của thương hiệu BINOVET.',
      },
      {
        year: '2010',
        text: 'Khánh thành nhà máy sản xuất dược thú y đầu tiên đạt chuẩn GMP-WHO, khẳng định vị thế về chất lượng trên thị trường trong nước.',
      },
      {
        year: '2018',
        text: 'Mở rộng hệ sinh thái Sanford Pharma USA và Viaprotic, ứng dụng công nghệ hiện đại từ Hoa Kỳ vào sản xuất chuyên sâu.',
      },
      {
        year: 'Hiện tại',
        text: 'Trở thành tập đoàn dược phẩm thú y hàng đầu Việt Nam với mạng lưới hơn 1.000 đại lý và xuất khẩu sang nhiều thị trường quốc tế.',
      },
    ],
  },
  tamNhin: {
    visionTitle: 'Tầm nhìn chiến lược',
    visionText:
      'Trở thành Tập đoàn dược phẩm với hệ sinh thái công nghệ sinh học và dược phẩm toàn diện, mang lại hiệu quả thiết thực và bền vững trong chăn nuôi, vươn tầm quốc tế.',
    missionTitle: 'Sứ mệnh cao cả',
    missionText:
      'Bảo vệ sức khỏe cho con người và vật nuôi thông qua các sản phẩm hữu hiệu; góp phần bảo vệ môi trường và phát triển cộng đồng chăn nuôi bền vững.',
    quoteText:
      '"Chất lượng là danh dự, sự hài lòng của bà con là thước đo thành công của Binovet."',
    quoteAuthor: 'Ban Lãnh Đạo',
    quoteRole: 'binovet Group',
  },
  coSo: {
    title: 'Cơ sở vật chất',
    intro:
      'BINOVET đầu tư hệ thống trang thiết bị máy móc tiên tiến, dây chuyền sản xuất khép kín vận hành theo tiêu chuẩn GMP-WHO nghiêm ngặt nhất.',
    cardTitle: 'Nhà máy',
    cardText: 'Trung tâm nghiên cứu và kiểm soát chất lượng đầu ra khắt khe.',
    stats: [
      { number: '03', label: 'Nhà máy lớn' },
      { number: '10+', label: 'Dây chuyền' },
      { number: '5k', label: 'Diện tích m²' },
      { number: 'Top', label: 'Thương hiệu' },
    ],
  },
  coCau: {
    title: 'Cơ cấu tổ chức',
    intro:
      'Hệ thống quản trị tinh gọn với đội ngũ nhân sự chất lượng cao, tận tâm và chuyên nghiệp.',
    roles: [
      'Hội đồng Quản trị',
      'Tổng Giám đốc',
      'Khối Sản xuất - Kỹ thuật',
      'Khối Kinh doanh - Marketing',
      'Khối Hành chính - Nhân sự',
    ],
    quoteText:
      '"Chúng tôi tin rằng con người là tài sản quý giá nhất. Tại binovet, mỗi cá nhân đều là một mắt xích quan trọng trong hành trình bảo vệ sự phát triển rực rỡ của ngành chăn nuôi."',
  },
  thanhTuu: {
    heading: 'Thành tựu',
    title:
      'Sau hơn 20 năm hình thành và phát triển, với tư duy sáng tạo, mạnh dạn đổi mới và nỗ lực không ngừng. Thương hiệu dược thú y BINOVET đã trở thành một trong những doanh nghiệp lớn hàng đầu trên thị trường Việt Nam, đóng góp tích cực vào sự phát triển của đất nước nói chung và ngành chăn nuôi – thú y nói riêng. Với những thành tựu nổi bật, thương hiệu dược thú y BINOVET đã nhận được những danh hiệu và giải thưởng cao quý',
    images: [
      {
        url: '',
        subtitle: 'Giải thưởng',
        title: '"Doanh nghiệp Uy tín\n– Phát triển bền vững 2012"',
      },
      {
        url: '',
        subtitle: 'Giải thưởng',
        title: '"Huy chương Vàng\nvì Sức khoẻ Cộng đồng 2015"',
      },
      {
        url: '',
        subtitle: 'Danh hiệu',
        title: '"Thương hiệu Uy tín\nvì Sức khoẻ 2015"',
      },
    ],
  },
};

/**
 * English fallback content for the About page. The admin editor only stores the
 * canonical (Vietnamese) content, so when the visitor is browsing in English and
 * a field has not been overridden we fall back to these translations instead of
 * the Vietnamese defaults.
 */
export const aboutDefaultsEn: AboutContentResolved = {
  gioiThieu: {
    title: 'BINOVET Overview',
    paragraph1:
      'BINOVET is a veterinary pharmaceutical brand of the Veterinary Biotechnology JSC. With more than 20 years of growth, we are proud to deliver high-quality pharmaceutical solutions powered by advanced American technology.',
    paragraph2:
      'We pursue continuous innovation, improving our quality and service to meet the ever-rising demands of the livestock industry at home and abroad.',
    stat1Number: '200+',
    stat1Label: 'Products',
    stat2Number: '63',
    stat2Label: 'Provinces',
  },
  lichSu: {
    title: 'Our History',
    intro:
      "A proud journey across more than two decades of dedication to Vietnam's livestock industry.",
    timeline: [
      {
        year: '2002',
        text: 'The Veterinary Biotechnology JSC was officially founded, laying the foundation for the birth of the BINOVET brand.',
      },
      {
        year: '2010',
        text: 'Inaugurated our first GMP-WHO certified veterinary pharmaceutical factory, affirming our reputation for quality in the domestic market.',
      },
      {
        year: '2018',
        text: 'Expanded the Sanford Pharma USA and Viaprotic ecosystem, applying advanced American technology to specialised production.',
      },
      {
        year: 'Today',
        text: "Became one of Vietnam's leading veterinary pharmaceutical groups, with a network of over 1,000 distributors and exports to many international markets.",
      },
    ],
  },
  tamNhin: {
    visionTitle: 'Strategic Vision',
    visionText:
      'To become a pharmaceutical group with a comprehensive biotechnology and pharmaceutical ecosystem, delivering practical and sustainable value in livestock farming and reaching international markets.',
    missionTitle: 'Our Mission',
    missionText:
      'To protect the health of people and animals through effective products, while helping to safeguard the environment and build a sustainable livestock community.',
    quoteText:
      '"Quality is our honour, and the satisfaction of farmers is the true measure of Binovet\'s success."',
    quoteAuthor: 'Board of Leadership',
    quoteRole: 'binovet Group',
  },
  coSo: {
    title: 'Facilities',
    intro:
      'BINOVET invests in advanced machinery and closed-loop production lines operated to the strictest GMP-WHO standards.',
    cardTitle: 'Factory',
    cardText: 'A research centre with rigorous output quality control.',
    stats: [
      { number: '03', label: 'Large factories' },
      { number: '10+', label: 'Production lines' },
      { number: '5k', label: 'Area (m²)' },
      { number: 'Top', label: 'Brand' },
    ],
  },
  coCau: {
    title: 'Organisational Structure',
    intro:
      'A lean management system staffed by a dedicated, professional and highly skilled team.',
    roles: [
      'Board of Directors',
      'General Director',
      'Production & Technical Division',
      'Sales & Marketing Division',
      'Administration & HR Division',
    ],
    quoteText:
      '"We believe people are our most valuable asset. At binovet, every individual is a vital link in the journey to protect the thriving growth of the livestock industry."',
  },
  thanhTuu: {
    heading: 'Achievements',
    title:
      "After more than 20 years of growth — driven by creative thinking, bold innovation and relentless effort — the BINOVET veterinary pharmaceutical brand has become one of the leading enterprises in the Vietnamese market, contributing actively to the country's development and to the livestock and veterinary sector in particular. For these outstanding achievements, BINOVET has received prestigious titles and awards.",
    images: [
      {
        url: '',
        subtitle: 'Award',
        title: '"Reputable Enterprise\n– Sustainable Development 2012"',
      },
      {
        url: '',
        subtitle: 'Award',
        title: '"Gold Medal\nfor Community Health 2015"',
      },
      {
        url: '',
        subtitle: 'Title',
        title: '"Reputable Brand\nfor Health 2015"',
      },
    ],
  },
};

export function mergeAbout(
  data?: AboutPageContent | null,
  locale: 'vi' | 'en' = 'vi',
): AboutContentResolved {
  const d = data || {};
  const base = locale === 'en' ? aboutDefaultsEn : aboutDefaults;
  return {
    gioiThieu: { ...base.gioiThieu, ...(d.gioiThieu || {}) } as AboutContentResolved['gioiThieu'],
    lichSu: {
      ...base.lichSu,
      ...(d.lichSu || {}),
      timeline:
        d.lichSu?.timeline && d.lichSu.timeline.length > 0
          ? d.lichSu.timeline
          : base.lichSu.timeline,
    } as AboutContentResolved['lichSu'],
    tamNhin: { ...base.tamNhin, ...(d.tamNhin || {}) } as AboutContentResolved['tamNhin'],
    coSo: {
      ...base.coSo,
      ...(d.coSo || {}),
      stats:
        d.coSo?.stats && d.coSo.stats.length > 0
          ? d.coSo.stats
          : base.coSo.stats,
    } as AboutContentResolved['coSo'],
    coCau: {
      ...base.coCau,
      ...(d.coCau || {}),
      roles:
        d.coCau?.roles && d.coCau.roles.length > 0
          ? d.coCau.roles
          : base.coCau.roles,
    } as AboutContentResolved['coCau'],
    thanhTuu: {
      ...base.thanhTuu,
      ...(d.thanhTuu || {}),
      images:
        d.thanhTuu?.images && d.thanhTuu.images.length > 0
          ? d.thanhTuu.images.map((item) =>
              typeof item === 'string'
                ? { url: item, title: '', subtitle: '' }
                : { url: item?.url || '', title: item?.title || '', subtitle: item?.subtitle || '' }
            )
          : base.thanhTuu.images,
    } as AboutContentResolved['thanhTuu'],
  };
}
