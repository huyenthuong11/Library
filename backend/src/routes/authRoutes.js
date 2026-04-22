import express from "express";
import Account from "../models/user/Account.js";
import Reader from "../models/user/Reader.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import client from "../services/redis.service.js";
import sgMail from '@sendgrid/mail';
import authMiddleware from "../middleware/authMiddleware.js";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const router = express.Router();

//POST /api/auth/sendOtp
router.post("/sendOtp", async(req, res) => {
    const {email} = req.body;
    const existingUser = await Account.findOne({ email });
    if(existingUser) {
        return res.status(400).json({
            message: "Email đã tồn tại",
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
        subject: '[Thư viện Cầu Giấy] Mã xác minh đăng ký tài khoản',
        text: `Cảm ơn bạn đã đăng ký sử dụng dịch vụ tại Thư viện Cầu Giấy. Để hoàn tất quá trình tạo tài khoản, vui lòng sử dụng mã xác minh dưới đây:
                \nMã OTP của bạn là: ${otp}
                \nLưu ý: Mã này có hiệu lực trong vòng 5 phút. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.
                \nTrân trọng,
                \nThư viện Cầu Giấy`,
    };

    await sgMail.send(msg);
    await client.set(`otp:${email}`, otp.toString(), { EX: 300 });
    res.json({ message: "OTP đã gửi" });
});


//POST /api/auth/register
router.post("/register", async(req, res) => {
    try {
        const {email, password, otp} = req.body;
        
        if (!email) {
            return res.status(400).json({
                message: "Email là bắt buộc",
            });
        }

        if(!password) {
            return res.status(400).json({
                message: "Password là bắt buộc",
            });
        }

        const savedOtp = await client.get(`otp:${email}`);

        if (!savedOtp) {
            return res.status(400).json({ message: "OTP hết hạn" });
        }

        if (savedOtp !== otp) {
            return res.status(400).json({ message: "OTP sai" });
        }

        await client.del(`otp:${email}`);
        
        const newAccount = new Account({
            email,
            password,
            role: "reader",
            status: "activate"
        });
        
        await newAccount.save();
        
        const newReader = new Reader({
            accountId: newAccount._id
        });

        await newReader.save();

        res.status(201).json({
            message: "Đăng ký thành công",
            accountId: newAccount._id,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Đăng ký thất bại",
        });
    }
});

//POST /api/auth/login
router.post("/login", async(req, res) => {
    try {
        const {email, password} = req.body;
        if (!email) {
            return res.status(400).json({
                message: "Email là bắt buộc",
            });
        }

        if(!password) {
            return res.status(400).json({
                message: "Password là bắt buộc",
            });
        }

        const account = await Account.findOne({ email });

        if(!account) {
            return res.status(400).json({
                message: "Người dùng không tồn tại",
            });
        }

        const isMatch = await bcrypt.compare(password, account.password);
        if(!isMatch) {
            return res.status(400).json({
                message: "Sai mật khẩu",
            });
        }

        const token = jwt.sign(
            { 
                accountId: account._id,
                role: account.role,
                status: account.status
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d"}
        );

        res.json({
            message: "Đăng nhập thành công",
            token,
            account: {
                id: account._id,
                email: account.email,
                role: account.role,
                status: account.status
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Đăng nhập thất bại"
        })
    }
})

//PUT /api/auth/:id/change-password
router.put("/:id/change-password", authMiddleware, async(req, res) => {
    try {
        const {oldPassword, newPassword} = req.body;
        const user = await Account.findById(req.params.id);
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({message: "Mật khẩu cũ không đúng"})
        }
        user.password = newPassword;
        await user.save();
        res.json({ message: "Đổi mật khẩu thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Lỗi server"});
    }
})



export default router; 