import { NextResponse } from 'next/server';
import { contactService } from '@/services';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, phoneNumber, emailAddress, messageBox, locale } = body;

    // Validation — name + phone are required; message is optional (lead popup)
    if (!fullName || !phoneNumber) {
      return NextResponse.json(
        { error: 'Vui lòng nhập họ tên và số điện thoại.' },
        { status: 400 }
      );
    }

    // Persist the request so it shows up in the admin dashboard
    await contactService.create({ fullName, phoneNumber, emailAddress, messageBox, locale });

    return NextResponse.json({
      success: true,
      message: 'Yêu cầu của bạn đã được gửi thành công. Chúng tôi sẽ liên hệ trong thời gian sớm nhất.'
    });
  } catch (error) {
    console.error('Error saving contact request:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
