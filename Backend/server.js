require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const rateLimit = require('express-rate-limit');


const PORT = 3000;

// allow JSON data
const app = express();
app.use(express.json());
app.use(cookieParser());

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 15, // Limit each IP to 15 login requests per windowMs
    message: { 
        message: "Too many login attempts from this IP, please try again after 15 minutes." 
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const MOCK_DATABASE = [
    {
        username: "TheCulled",
        passwordHash: "$2b$10$yTuYoBVPH6xs.7tt4oOUPujCafsdHF.bdUYFvfexqYpBB45E2wG56"
    }
];

const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.static('../frontend/Public'));


// When the frontend asks for /api/v1/login, it will respond with the following:
app.post('/api/v1/login', loginLimiter, async (req, res) => {
    console.log("Login endpoint hit!");
    const { username, password } = req.body;

    //find username
    const foundUser = MOCK_DATABASE.find(user => user.username === username);

    //if no username, then respond 401
    if (!foundUser) {
        return res.status(401).json({ message: "Invalid username or password." });
    }

    try {
        //try to match password with hash via bcrypt
        const isMatch = await bcrypt.compare(password, foundUser.passwordHash);

        if (isMatch) {

            const token = jwt.sign(
                { username: foundUser.username }, 
                JWT_SECRET, 
                { expiresIn: '1hr' } // Token expires automatically in 1 hour
            );

            res.cookie('userToken', token, {
                httpOnly: true, //Safeguard
                secure: false,  //If HTTPS, then true
                maxAge: 3600000, // 1 hour expiration
                sameSite: 'strict'
            });

            res.json({ message: "Authentication successful!" });
            
        } else {
            res.status(401).json({ message: "Invalid username or password." });
        }

    } catch (error) {
        console.error("Security error during authentication:", error);
        res.status(500).json({ message: "Internal server security error." });
    }
});


function verifyPrivateAccess(req, res, next) {
    const token = req.cookies.userToken; //Get cookie

    if (!token) {
        //Direct to login if theres no token present
        return res.redirect('/login.html');
    }

    try {
        //Inspect token
        const verifiedData = jwt.verify(token, JWT_SECRET);
        req.user = verifiedData; //Store user details
        next(); //Valid
    } catch (error) {
        //redirect bad or forged tokens
        res.clearCookie('userToken');
        return res.redirect('/login.html');
    }
}

app.use('/private', verifyPrivateAccess, express.static(path.join(__dirname, '../frontend/private')));

app.listen(PORT, () => {
    console.log(`Server is running locally at http://localhost:${PORT}`);
    console.log("Press Ctrl + C in the terminal to stop the server.");
});
