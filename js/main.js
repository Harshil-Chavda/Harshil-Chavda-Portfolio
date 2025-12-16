// --- 1. SMOOTH SCROLL ---
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true
});
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

// --- 2. MAIN EXECUTION ---
window.addEventListener("load", () => {
    gsap.registerPlugin(ScrollTrigger);

    // ============================================
    // PRELOADER LOGIC (Quantum Loader)
    // ============================================
    const preloaderTimeline = gsap.timeline();
    
    preloaderTimeline.to(".quantum-loader-box", {
        duration: 3, // Loader spins for 3 seconds
    })
    .to(".preloader", {
        opacity: 0,
        duration: 0.8, 
        ease: "power4.inOut",
        onComplete: () => {
            document.querySelector(".preloader").style.display = "none";
        }
    })
    .add(() => {
        // Enable Scroll and Trigger Site Animations
        document.body.classList.remove("loading");
        initSiteAnimations();
    });

    // ============================================
    // HERO MAGNETIC TEXT EFFECT
    // ============================================
    const magText = document.querySelectorAll('.mag-text');
    magText.forEach(text => {
        const split = new SplitType(text, { types: 'chars' });
        
        document.addEventListener('mousemove', (e) => {
            split.chars.forEach(char => {
                const rect = char.getBoundingClientRect();
                const charCenterX = rect.left + rect.width / 2;
                const charCenterY = rect.top + rect.height / 2;
                
                const deltaX = e.clientX - charCenterX;
                const deltaY = e.clientY - charCenterY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                
                const maxDist = 200; 

                if (distance < maxDist) {
                    const power = (1 - distance / maxDist) * 30; 
                    gsap.to(char, {
                        x: -(deltaX / distance) * power,
                        y: -(deltaY / distance) * power,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                } else {
                    gsap.to(char, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
                }
            });
        });
    });

    // ============================================
    // SITE ANIMATIONS
    // ============================================
    function initSiteAnimations() {
        // Reveal Navbar
        gsap.to("nav", { opacity: 1, y: 0, duration: 1 });

        // Hero Text Entrance
        gsap.from(".hero-title .char", {
            y: 100,
            opacity: 0,
            rotateX: 90,
            stagger: 0.05,
            duration: 1.5,
            ease: "power4.out",
            delay: 0.2
        });

        // Reveal Texts (Scroll Triggered)
        const revealTargets = document.querySelectorAll('.reveal-text');
        revealTargets.forEach(target => {
            const split = new SplitType(target, { types: 'lines, words' });
            gsap.from(split.words, {
                scrollTrigger: {
                    trigger: target,
                    start: 'top 90%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.02,
                ease: "power3.out"
            });
        });

        // Horizontal Scrolls
        createHorizontalScroll('education-scroll', 'edu-wrap');
        createHorizontalScroll('projects-scroll', 'proj-wrap');
    }

    function createHorizontalScroll(containerId, wrapId) {
        const container = document.getElementById(containerId);
        const wrap = document.getElementById(wrapId);
        
        if(container && wrap) {
            const getScrollAmount = () => -(wrap.scrollWidth - window.innerWidth);
            gsap.to(wrap, {
                x: getScrollAmount,
                ease: "none",
                scrollTrigger: {
                    trigger: container,
                    start: "top top",
                    end: () => `+=${wrap.scrollWidth - window.innerWidth}`,
                    pin: true,
                    scrub: 1,
                    invalidateOnRefresh: true
                }
            });
        }
    }
});

// --- 3. MAGNETIC CURSOR ---
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
const hoverTargets = document.querySelectorAll('.hover-target');

document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
    gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.35, ease: 'power2.out' });
});

hoverTargets.forEach(target => {
    target.addEventListener('mouseenter', () => {
        ring.classList.add('hovered');
        cursor.style.transform = 'translate(-50%, -50%) scale(0.5)';
    });
    target.addEventListener('mouseleave', () => {
        ring.classList.remove('hovered');
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    });
});

// --- 4. PARTICLES (Three.js) ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('webgl-canvas'), alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const geometry = new THREE.BufferGeometry();
const count = 1000;
const positions = new Float32Array(count * 3);
for(let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * 20;

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const material = new THREE.PointsMaterial({ size: 0.03, color: 0x27c93f, transparent: true, opacity: 0.6 });
const particles = new THREE.Points(geometry, material);
scene.add(particles);
camera.position.z = 5;

let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth - 0.5;
    mouseY = e.clientY / window.innerHeight - 0.5;
});

function animate() {
    particles.rotation.y += 0.002;
    particles.rotation.x = mouseY * 0.1;
    particles.rotation.y += mouseX * 0.1;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});