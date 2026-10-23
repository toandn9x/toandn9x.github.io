/* ==========================================================================
   THÔNG TIN ĐÁM CƯỚI — chỉ cần sửa file này.
   - Giữ nguyên dấu nháy '...' và dấu phẩy cuối dòng.
   - Ảnh: chép ảnh vào thư mục photos/ rồi ghi 'photos/ten-anh.jpg'.
   - Giờ: dạng 'NĂM-THÁNG-NGÀYTGIỜ:PHÚT', ví dụ '2026-12-20T11:00' (giờ Việt Nam).
   ========================================================================== */
window.WEDDING = {

  groom: {
    name: 'Minh Quân',
    fullName: 'Nguyễn Minh Quân',
    role: 'Trưởng nam', // Trưởng nam / Thứ nam / Út nam... để trống '' nếu không muốn hiện
    photo: 'https://images.unsplash.com/photo-1647573029950-7bf1793cb3b6?w=720&h=960&fit=crop&crop=focalpoint&fp-x=0.28&fp-y=0.32&fp-z=1.9',
    intro: 'Kỹ sư phần mềm, thích cà phê sáng và những chuyến đi xa. Người luôn mang theo ô cho cả hai.',
    father: 'Ông Nguyễn Văn An',
    mother: 'Bà Trần Thị Bình',
    address: 'Hoàn Kiếm, Hà Nội',
  },

  bride: {
    name: 'Thu Hà',
    fullName: 'Lê Thu Hà',
    role: 'Thứ nữ',
    photo: 'https://images.unsplash.com/photo-1701266109883-7f0e76a75b64?w=720&h=960&fit=crop',
    intro: 'Cô giáo dạy văn, mê hoa và những trang sách cũ. Người biến mọi ngày thường thành ngày đẹp.',
    father: 'Ông Lê Văn Cường',
    mother: 'Bà Phạm Thị Dung',
    address: 'Ba Đình, Hà Nội',
  },

  // Giờ tiệc chính: dùng để đếm ngược, tính ngày Âm lịch và hiện trên thiệp.
  date: '2026-12-20T11:00',

  tagline: 'Chúng mình về chung một nhà',

  // Ảnh lớn ở đầu trang và ảnh nền cuối trang.
  cover: 'https://images.unsplash.com/photo-1652494268816-8e3d0282cf2f?w=900&h=1200&fit=crop',
  closing: 'https://images.unsplash.com/photo-1551198643-b2a9ed2e3236?w=1600&h=1100&fit=crop',

  // Lời mời. {khach} = tên khách trên link, {xung} = cách xưng hô (anh, chị, bác...).
  invitation: {
    heading: 'Trân trọng kính mời',
    body: 'tới dự bữa tiệc chung vui cùng gia đình chúng tôi',
    closing: 'Sự hiện diện của {xung} là niềm vinh hạnh của gia đình chúng tôi.',
  },

  // Các câu chữ khác trên trang. Cũng dùng được {khach} và {xung}.
  texts: {
    gift: 'Sự hiện diện của {xung} là món quà quý nhất. Nếu không thể đến chung vui, {xung} có thể gửi lời chúc qua đây.',
    thanks: 'Cảm ơn {xung} đã dành thời gian đọc thiệp. Hẹn gặp {xung} trong ngày vui của chúng mình!',
  },

  // Ảnh & chữ hiện khi gửi link qua Zalo / Messenger / Facebook (chỉ có tác dụng khi chạy trên Cloudflare).
  // Để trống '' thì tự ghép: "Thiệp mời cưới · Minh Quân & Thu Hà", "Chủ nhật, 20.12.2026 · <nơi tổ chức>".
  share: {
    title: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1551198643-b2a9ed2e3236', // nên là ảnh ngang; trống thì dùng ảnh bìa
  },

  // Dòng ghi nguồn ảnh ở chân trang. Dùng ảnh của bạn thì để ''.
  photoCredit: 'Ảnh minh hoạ: Unsplash',

  events: [
    {
      title: 'Lễ Vu Quy',
      time: '2026-12-20T08:00',
      place: 'Tư gia nhà gái',
      address: '25 Phan Đình Phùng, Ba Đình, Hà Nội',
    },
    {
      title: 'Lễ Thành Hôn',
      time: '2026-12-20T09:30',
      place: 'Tư gia nhà trai',
      address: '12 Hàng Bạc, Hoàn Kiếm, Hà Nội',
    },
    {
      title: 'Tiệc Cưới',
      time: '2026-12-20T11:00',
      place: 'Trung tâm Hội nghị Tiệc cưới Hoàng Gia',
      hall: 'Sảnh Ngọc Lan · Tầng 2',
      address: '68 Nguyễn Du, Hai Bà Trưng, Hà Nội',
      main: true, // địa điểm hiện bản đồ
    },
  ],

  story: [
    { when: 'Thu 2019', title: 'Lần đầu gặp gỡ', text: 'Một buổi chiều mưa ở hiệu sách cũ phố Đinh Lễ, hai người cùng với tay lấy một cuốn sách.' },
    { when: 'Xuân 2020', title: 'Lời tỏ tình', text: 'Bên hồ Gươm lúc hoa sưa nở trắng, anh lắp bắp nói câu mà anh tập suốt một tuần.' },
    { when: 'Hè 2024', title: 'Chuyến đi đầu tiên', text: 'Đà Lạt sương sớm, hai đứa lạc đường và tìm thấy quán bánh căn ngon nhất đời.' },
    { when: 'Tết 2026', title: 'Lời cầu hôn', text: 'Trong căn bếp nhỏ ngày mùng Hai, chiếc nhẫn được giấu dưới đáy chén chè.' },
  ],

  gallery: [
    'https://images.unsplash.com/photo-1551198643-b2a9ed2e3236',
    'https://images.unsplash.com/photo-1670972027764-3f2a63066d59',
    'https://images.unsplash.com/photo-1558599308-acc9feb34773',
    'https://images.unsplash.com/photo-1791276091377-58c2553d5b5f',
    'https://images.unsplash.com/photo-1648526593789-0f4111100931',
    'https://images.unsplash.com/photo-1777917674958-45afef4e2b83',
    'https://images.unsplash.com/photo-1731994710373-849feb905390',
    'https://images.unsplash.com/photo-1776929524976-cff6c9def859',
    'https://images.unsplash.com/photo-1791276091344-a3a38f43ea90',
    'https://images.unsplash.com/photo-1652494268816-8e3d0282cf2f',
  ],

  // Mừng cưới qua chuyển khoản. bank = mã ngân hàng VietQR (VCB, MB, TCB, ACB, BIDV, ICB, VPB, TPB...).
  // ĐÂY LÀ SỐ TÀI KHOẢN GIẢ ĐỂ XEM THỬ — nhớ thay bằng tài khoản thật.
  gifts: [
    { label: 'Mừng cưới chú rể', bank: 'VCB', bankName: 'Vietcombank', account: '0011223344556', holder: 'NGUYEN MINH QUAN' },
    { label: 'Mừng cưới cô dâu', bank: 'MB', bankName: 'MB Bank', account: '9988776655', holder: 'LE THU HA' },
  ],

  // Xác nhận tham dự & lời chúc lưu vào Google Sheets. Cách lấy link: xem HUONG-DAN.md, mục 4.
  // Để trống '' thì form vẫn hiện nhưng KHÔNG lưu được câu trả lời.
  rsvp: {
    endpoint: '',
    deadline: '10/12/2026',
  },

  music: {
    src: 'assets/music/canon-in-d.mp3',
    credit: 'Canon in D — Kevin MacLeod (incompetech.com) · CC BY 3.0',
  },

  // Hiệu ứng rơi: 'petals' (cánh hoa), 'hearts' (tim), 'none' (tắt).
  effect: 'petals',

  // Danh sách giao diện. ?template=1 là cái đầu tiên, ?template=2 là cái thứ hai...
  templates: ['songhy'],

  // (Tuỳ chọn) Link ngắn theo mã khách: ?g=tuyen -> 'Chị Tuyền'.
  // Lưu ý: ai mở mã nguồn trang cũng đọc được danh sách này.
  guests: {
    tuyen: { name: 'Chị Tuyền' },
    'gd-chu-hung': { name: 'Gia đình chú Hùng' },
  },
};
