import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, phoneNumber, emailAddress, messageBox } = body;

    // Validation
    if (!fullName || !phoneNumber || !messageBox) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ thông tin bắt buộc.' },
        { status: 400 }
      );
    }

    // In a real application, you would send an email here using Nodemailer, SendGrid, etc.
    // console.log('Sending email to admin...', { fullName, phoneNumber, emailAddress, messageBox });
    // console.log('Sending confirmation email to user...', emailAddress);

    // Simulate work
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: 'Yêu cầu của bạn đã được gửi thành công. Chúng tôi sẽ liên hệ trong thời gian sớm nhất.'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
