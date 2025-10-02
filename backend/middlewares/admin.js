const admin = (req, res, next) => {
  // Sample check
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  // More descriptive error message
  return res.status(403).json({ 
    error: 'Access denied. Admin privileges required.',
    message: 'You do not have permission to access this resource. This area is restricted to administrators only.',
    redirectTo: '/frontend/Userhandling/home.html'
  });
};

module.exports = admin;