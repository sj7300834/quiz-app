import React from 'react';
import './About.css'; // CSS file for styling

const About = () => {
    return (
        <div className="about-container">
            <h1>About Quiz App</h1>
            <p>
                Welcome to <strong>Quiz App</strong>, your ultimate destination for fun and engaging quizzes! 
                Whether you're looking to test your knowledge, learn something new, or just have a good time, 
                our app has something for everyone.
            </p>

            <h2>Our Mission</h2>
            <p>
                Our mission is to make learning fun and accessible for everyone. We believe that quizzes are 
                a great way to challenge yourself, improve your knowledge, and have fun at the same time.
            </p>

            <h2>Features</h2>
            <ul>
                <li>📚 Wide range of topics: From general knowledge to specific subjects, we've got it all.</li>
                <li>⏱️ Timed quizzes: Test your speed and accuracy with our timed quiz feature.</li>
                <li>🏆 Track your progress: Keep an eye on your scores and see how you improve over time.</li>
                <li>🔐 Secure and user-friendly: Your data is safe with us, and our app is easy to use.</li>
            </ul>

            <h2>Why Choose Us?</h2>
            <p>
                We are committed to providing a seamless and enjoyable experience for our users. Our quizzes 
                are designed to be both challenging and fun, ensuring that you always have a great time while 
                learning something new.
            </p>

            <h2>Contact Us</h2>
            <p>
                Have questions or feedback? Feel free to reach out to us at 
                <a href="http://localhost:3000/contact">support@quizapp.com</a>. We'd love to hear from you!
            </p>
        </div>
    );
};

export default About;