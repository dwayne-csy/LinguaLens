const homePage = (req, res) => {
    res.status(200).json({ message: "Welcome to LinguaLens Home Page!" });
};

module.exports = { homePage };