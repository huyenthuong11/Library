import express from "express";
import Account from "../models/user/Account.js";
import client from "../services/redis.service.js";
import sgMail from '@sendgrid/mail';
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/authMiddleware.js";
import checkRole from "../middleware/authRoleMiddleware.js";
import checkStatus from "../middleware/authStatusMiddleware.js";


sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const router = express.Router();

//POST /api/forgotPassword/sendOtp
router.post("/sendOtp", authMiddleware, checkRole(["reader"]), checkStatus(["activate"]), async(req, res) => {
    const {email} = req.body;
    const user = await Account.findOne({ email });
    if(!user) {
        return res.status(400).json({
            message: "Email không tồn tại",
        });
    }
    const savedOtp = await client.get(`otp:${email}`);
    if (savedOtp) {
        return res.status(429).json({
            message: "Vui lòng đợi trước khi gửi lại OTP"
        });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log(otp);
    const msg = {
        to: email,
        from: 'ksbzw7eur@gmail.com', 
        subject: '[Thư viện Cầu Giấy] Mã xác minh tìm lại tài khoản',
        text: `Cảm ơn bạn đã đăng ký sử dụng dịch vụ tại Thư viện Cầu Giấy. Để hoàn tất quá trình tìm lại tài khoản, vui lòng sử dụng mã xác minh dưới đây:
                \nMã OTP của bạn là: ${otp}
                \nLưu ý: Mã này có hiệu lực trong vòng 5 phút. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.
                \nTrân trọng,
                \nThư viện Cầu Giấy`,
    };
    
    await sgMail.send(msg);
    await client.set(`otp:${email}`, otp.toString(), { EX: 300 });
    res.json({ message: "OTP đã gửi" });
});

//POST /api/forgotPassword/receiveOtp
router.post("/receiveOtp", authMiddleware, checkRole(["reader"]), checkStatus(["activate"]), async(req, res) => {
    const {email, otp} = req.body;
    const account = await Account.findOne({ email });
    if(!account) {
        return res.status(400).json({
            message: "Người dùng không tồn tại",
        });
    }
    const savedOtp = await client.get(`otp:${email}`);
    if (!savedOtp) {
        return res.status(400).json({ message: "OTP hết hạn" });
    }

    if (savedOtp !== otp) {
        return res.status(400).json({ message: "OTP sai" });
    }
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "5m"
    });
    await client.del(`otp:${email}`);
    return res.json({ 
        message: "Xác nhận OTP thành công",
        token
    });
})


//PUT /api/forgotPassword/changePassword
router.put("/changePassword", authMiddleware, checkRole(["reader"]), checkStatus(["activate"]), async(req, res) => {
    try {
        const {newPassword, token} = req.body;
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({
                message: "Token không hợp lệ hoặc hết hạn",
            })
        }
        const user = await Account.findOne({ email: decoded.email });
        user.password = newPassword;
        await user.save();
        res.json({ message: "Đổi mật khẩu thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Lỗi server"});
    }
})

export default router;
