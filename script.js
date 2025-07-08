// Utility Functions for Swirl
const { PI, cos, sin, abs, sqrt, pow, round, random, atan2 } = Math;
const HALF_PI = 0.5 * PI;
const TAU = 2 * PI;
const TO_RAD = PI / 180;
const floor = n => n | 0;
const rand = n => n * random();
const randIn = (min, max) => rand(max - min) + min;
const randRange = n => n - rand(2 * n);
const fadeIn = (t, m) => t / m;
const fadeOut = (t, m) => (m - t) / m;
const fadeInOut = (t, m) => {
    let hm = 0.5 * m;
    return abs((t + hm) % m - hm) / (hm);
};
const dist = (x1, y1, x2, y2) => sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
const angle = (x1, y1, x2, y2) => atan2(y2 - y1, x2 - x1);
const lerp = (n1, n2, speed) => (1 - speed) * n1 + speed * n2;

// Swirl Effect
const particleCount = 700;
const particlePropCount = 9;
const particlePropsLength = particleCount * particlePropCount;
const rangeY = 100;
const baseTTL = 50;
const rangeTTL = 150;
const baseSpeed = 0.1;
const rangeSpeed = 2;
const baseRadius = 1;
const rangeRadius = 4;
const baseHue = 220;
const rangeHue = 100;
const noiseSteps = 8;
const xOff = 0.00125;
const yOff = 0.00125;
const zOff = 0.0005;
const backgroundColor = 'hsla(260,40%,5%,1)';

let container;
let canvas;
let ctx;
let center;
let tick;
let simplex;
let particleProps;

function setupSwirl() {
    createCanvas();
    resize();
    initParticles();
    draw();
}

function initParticles() {
    tick = 0;
    simplex = new SimplexNoise();
    particleProps = new Float32Array(particlePropsLength);

    let i;
    for (i = 0; i < particlePropsLength; i += particlePropCount) {
        initParticle(i);
    }
}

function initParticle(i) {
    let x, y, vx, vy, life, ttl, speed, radius, hue;
    x = rand(canvas.a.width);
    y = center[1] + randRange(rangeY);
    vx = 0;
    vy = 0;
    life = 0;
    ttl = baseTTL + rand(rangeTTL);
    speed = baseSpeed + rand(rangeSpeed);
    radius = baseRadius + rand(rangeRadius);
    hue = baseHue + rand(rangeHue);

    particleProps.set([x, y, vx, vy, life, ttl, speed, radius, hue], i);
}

function drawParticles() {
    let i;
    for (i = 0; i < particlePropsLength; i += particlePropCount) {
        updateParticle(i);
    }
}

function updateParticle(i) {
    let i2 = 1 + i, i3 = 2 + i, i4 = 3 + i, i5 = 4 + i, i6 = 5 + i, i7 = 6 + i, i8 = 7 + i, i9 = 8 + i;
    let n, x, y, vx, vy, life, ttl, speed, x2, y2, radius, hue;

    x = particleProps[i];
    y = particleProps[i2];
    n = simplex.noise3D(x * xOff, y * yOff, tick * zOff) * noiseSteps * TAU;
    vx = lerp(particleProps[i3], cos(n), 0.5);
    vy = lerp(particleProps[i4], sin(n), 0.5);
    life = particleProps[i5];
    ttl = particleProps[i6];
    speed = particleProps[i7];
    x2 = x + vx * speed;
    y2 = y + vy * speed;
    radius = particleProps[i8];
    hue = particleProps[i9];

    drawParticle(x, y, x2, y2, life, ttl, radius, hue);

    life++;

    particleProps[i] = x2;
    particleProps[i2] = y2;
    particleProps[i3] = vx;
    particleProps[i4] = vy;
    particleProps[i5] = life;

    (checkBounds(x, y) || life > ttl) && initParticle(i);
}

function drawParticle(x, y, x2, y2, life, ttl, radius, hue) {
    ctx.a.save();
    ctx.a.lineCap = 'round';
    ctx.a.lineWidth = radius;
    ctx.a.strokeStyle = `hsla(${hue},100%,60%,${fadeInOut(life, ttl)})`;
    ctx.a.beginPath();
    ctx.a.moveTo(x, y);
    ctx.a.lineTo(x2, y2);
    ctx.a.stroke();
    ctx.a.closePath();
    ctx.a.restore();
}

function checkBounds(x, y) {
    return (
        x > canvas.a.width ||
        x < 0 ||
        y > canvas.a.height ||
        y < 0
    );
}

function createCanvas() {
    container = document.querySelector('.content--canvas');
    canvas = {
        a: document.createElement('canvas'),
        b: document.createElement('canvas')
    };
    canvas.b.style = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    `;
    container.appendChild(canvas.b);
    ctx = {
        a: canvas.a.getContext('2d'),
        b: canvas.b.getContext('2d')
    };
    center = [];
}

function resize() {
    const { innerWidth, innerHeight } = window;
    canvas.a.width = innerWidth;
    canvas.a.height = innerHeight;
    ctx.a.drawImage(canvas.b, 0, 0);
    canvas.b.width = innerWidth;
    canvas.b.height = innerHeight;
    ctx.b.drawImage(canvas.a, 0, 0);
    center[0] = 0.5 * canvas.a.width;
    center[1] = 0.5 * canvas.a.height;
}

function renderGlow() {
    ctx.b.save();
    ctx.b.filter = 'blur(8px) brightness(200%)';
    ctx.b.globalCompositeOperation = 'lighter';
    ctx.b.drawImage(canvas.a, 0, 0);
    ctx.b.restore();

    ctx.b.save();
    ctx.b.filter = 'blur(4px) brightness(200%)';
    ctx.b.globalCompositeOperation = 'lighter';
    ctx.b.drawImage(canvas.a, 0, 0);
    ctx.b.restore();
}

function renderToScreen() {
    ctx.b.save();
    ctx.b.globalCompositeOperation = 'lighter';
    ctx.b.drawImage(canvas.a, 0, 0);
    ctx.b.restore();
}

function draw() {
    tick++;
    ctx.a.clearRect(0, 0, canvas.a.width, canvas.a.height);
    ctx.b.fillStyle = document.body.classList.contains('light-theme') ? '#f5f5f5' : backgroundColor;
    ctx.b.fillRect(0, 0, canvas.a.width, canvas.a.height);
    drawParticles();
    renderGlow();
    renderToScreen();
    window.requestAnimationFrame(draw);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }

        // Close mobile nav after clicking a link
        const mobileNav = document.getElementById('mobile-nav');
        if (mobileNav.classList.contains('open')) {
            mobileNav.classList.remove('open');
            gsap.to(mobileNav, {
                right: "-100%",
                duration: 0.3,
                ease: "power2.in"
            });
        }
    });
});

// Mobile menu toggle
const mobileToggle = document.getElementById('mobile-toggle');
const mobileNav = document.getElementById('mobile-nav');
const closeNav = document.getElementById('close-nav');

function openMobileNav() {
    gsap.to(mobileNav, {
        right: 0,
        duration: 0.3,
        ease: "power2.out",
        onStart: () => {
            mobileNav.classList.add('open');
            mobileNav.setAttribute('aria-hidden', 'false');
            mobileToggle.setAttribute('aria-expanded', 'true');
            
            // Focus management for accessibility
            const firstLink = mobileNav.querySelector('a');
            if (firstLink) {
                firstLink.focus();
            }
        }
    });
}

function closeMobileNav() {
    gsap.to(mobileNav, {
        right: "-100%",
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
            mobileNav.classList.remove('open');
            mobileNav.setAttribute('aria-hidden', 'true');
            mobileToggle.setAttribute('aria-expanded', 'false');
            
            // Return focus to toggle button
            mobileToggle.focus();
        }
    });
}

mobileToggle.addEventListener('click', openMobileNav);
closeNav.addEventListener('click', closeMobileNav);

// Close mobile nav when clicking outside
document.addEventListener('click', (e) => {
    if (mobileNav.classList.contains('open') && 
        !mobileNav.contains(e.target) && 
        !mobileToggle.contains(e.target)) {
        closeMobileNav();
    }
});

// Close mobile nav on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        closeMobileNav();
    }
});

// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
const mobileThemeToggle = document.getElementById('mobile-theme-toggle');

function toggleTheme() {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    
    // Update ARIA attributes for accessibility
    const buttons = [themeToggle, mobileThemeToggle];
    buttons.forEach(button => {
        if (button) {
            button.setAttribute('aria-pressed', isLight.toString());
        }
    });
    
    // Announce theme change to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = `Switched to ${isLight ? 'light' : 'dark'} theme`;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

themeToggle.addEventListener('click', toggleTheme);
mobileThemeToggle.addEventListener('click', toggleTheme);

// Load saved theme preference
window.addEventListener('load', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        // Update ARIA attributes for saved theme
        const buttons = [themeToggle, mobileThemeToggle];
        buttons.forEach(button => {
            if (button) {
                button.setAttribute('aria-pressed', 'true');
            }
        });
    }
    setupSwirl();
    
    // Initialize mobile nav accessibility
    if (mobileNav) {
        mobileNav.setAttribute('aria-hidden', 'true');
    }
});

// Skills marquee animation
const skillTrack = document.querySelector('.skill-track');
const skillItems = document.querySelectorAll('.skill-item');
const skillWidth = skillItems[0].offsetWidth + 32;

gsap.to(skillTrack, {
    x: -skillWidth * skillItems.length,
    duration: 20,
    ease: "none",
    repeat: -1
});

// ScrollTrigger animations for sections
gsap.utils.toArray('.section').forEach(section => {
    gsap.from(section, {
        scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none none"
        },
        opacity: 0,
        y: 50,
        duration: 1
    });
});

// Experience stepper animation
gsap.utils.toArray('.stepper-item').forEach((item, i) => {
    gsap.to(item, {
        scrollTrigger: {
            trigger: item,
            start: "top 80%",
            toggleActions: "play none none none"
        },
        opacity: 1,
        x: 0,
        duration: 0.5,
        delay: i * 0.2,
        onStart: () => {
            item.classList.add('active');
        }
    });
});

// Project cards animation
gsap.utils.toArray('.project-card').forEach((card, i) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: "#projects",
            start: "top 80%",
            toggleActions: "play none none none"
        },
        opacity: 0,
        y: 50,
        duration: 0.5,
        delay: i * 0.1
    });
});

// Floating particles for decoration
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        const size = Math.random() * 10 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;

        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 10;

        particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;

        particlesContainer.appendChild(particle);
    }
}

// EmailJS Configuration and Form Handling
(function() {
    // Initialize EmailJS with your public key
    emailjs.init("r3ADKcPu1QAe3Nnl6"); // Clave pública real

    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const btnLoading = document.getElementById('btn-loading');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading state
        submitBtn.disabled = true;
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');

        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        // Send email using EmailJS
        emailjs.send('service_lv2eai4', 'template_bbznqis', formData)
            .then(function(response) {
                // Success
                showNotification('Message sent successfully!', 'success');
                form.reset();
            }, function(error) {
                // Error
                showNotification('Failed to send message. Please try again.', 'error');
            })
            .finally(function() {
                // Reset button state
                submitBtn.disabled = false;
                btnText.classList.remove('hidden');
                btnLoading.classList.add('hidden');
            });
    });

    // Notification function
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
            type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
    }
})();

createParticles();

// Handle window resize
window.addEventListener('resize', resize);
