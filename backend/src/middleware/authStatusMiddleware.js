

const checkStatus = (status) => {
    return (req, res, next) => {
        if (!req.user || !status.includes(req.user.status)) {
        return res.status(403).json({ 
            message: "Tài khoản của bạn đã bị vô hiệu hóa." 
        });
        }
        next();
    };
};

export default checkStatus;