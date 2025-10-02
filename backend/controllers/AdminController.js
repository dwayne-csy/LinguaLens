const adminDashboard = (req, res) => {
    res.status(200).json({
        message: "Welcome to the Admin Dashboard!"
    });
};

module.exports = { adminDashboard };