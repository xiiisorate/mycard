// ===== LOADING SCREEN =====
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        loadingScreen.classList.remove('hidden');
    }
}

// ===== MATRIX PERLIN NOISE BACKGROUND =====
class MatrixPerlinBackground {
    constructor() {
        this.canvas = document.getElementById('matrix-canvas');
        this.ctx = this.canvas.getContext('2d');
        // Организуем символы по смысловым категориям
        this.categories = {
            nature: '日月火水木金土雨雪風雲山川海空星光闇霧露霜虹雷電波浪森林花草葉枝根幹種実',
            numbers: '一二三四五六七八九十百千万億兆京垓',
            time: '年月日時分秒瞬間永遠過去現在未来朝昼夜暁黄昏',
            space: '東西南北上下左右中央前後内外遠近高低深浅広狭',
            emotions: '愛憎喜怒哀楽悲歓希望絶望夢想憂愁恋慕',
            body: '心魂体血肉骨皮髪目耳鼻口手足頭胸腹背腰膝指爪歯舌唇',
            qualities: '大小新古高低長短明暗快慢強弱好悪美醜清濁軽重',
            elements: '氷炎雷風土水火金木石鉄銀銅',
            actions: '見聞知感思考学習創造破壊建設移動停止',
            abstract: '真偽善悪正邪道理法則秩序混沌平和戦争',
            thin: 'イロハニホヘトチリヌルヲワカヨタレソツネナラムウヰノオクヤマケフコエテアサキユメミシヱヒモセス'
        };
        
        // Объединяем все категории
        this.chars = Object.values(this.categories).join('');
        this.fontSize = 12;
        this.time = 0;
        this.grid = [];
        
        // Определяем, мобильное ли устройство
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
        
        // Адаптивная скорость анимации (увеличена для большей активности)
        this.animationSpeed = this.isMobile ? 0.012 : 0.03;
        
        // Настройки для пиксельного рендеринга
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        
        // Глюк эффекты
        this.glitchEffects = {
            symbolShift: 0,
            randomFlicker: 0,
            chaosBurst: 0,
            matrixCorruption: 0,
            symbolScramble: 0,
            glitchZones: []
        };
        
        this.initPerlin();
        this.init();
        this.animate();
        
        window.addEventListener('resize', () => this.handleResize());
    }
    
    init() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        this.cols = Math.floor(this.canvas.width / this.fontSize);
        this.rows = Math.floor(this.canvas.height / this.fontSize);
        
        // Создаем сетку символов с начальным распределением по категориям
        this.grid = [];
        for (let x = 0; x < this.cols; x++) {
            this.grid[x] = [];
            for (let y = 0; y < this.rows; y++) {
                // Начальное распределение символов по позиции
                let initialCategory;
                const positionFactor = (x + y) % 5;
                
                switch(positionFactor) {
                    case 0: initialCategory = this.categories.thin; break;
                    case 1: initialCategory = this.categories.numbers; break;
                    case 2: initialCategory = this.categories.nature; break;
                    case 3: initialCategory = this.categories.time; break;
                    default: initialCategory = this.categories.space; break;
                }
                
                this.grid[x][y] = {
                    char: initialCategory[Math.floor(Math.random() * initialCategory.length)],
                    changeTime: Math.random() * 5000,
                    glitchOffset: 0,
                    flickerIntensity: 0,
                    corruptionLevel: 0
                };
            }
        }
        
        // Инициализируем зоны глюков
        this.initGlitchZones();
    }
    
    initGlitchZones() {
        this.glitchEffects.glitchZones = [];
        const numZones = Math.floor(Math.random() * 3) + 2; // 2-4 зоны
        
        for (let i = 0; i < numZones; i++) {
            this.glitchEffects.glitchZones.push({
                x: Math.floor(Math.random() * this.cols),
                y: Math.floor(Math.random() * this.rows),
                radius: Math.floor(Math.random() * 8) + 4,
                intensity: Math.random() * 0.8 + 0.2,
                type: Math.floor(Math.random() * 4), // 0-3 типы глюков
                life: Math.random() * 200 + 100
            });
        }
    }
    
    handleResize() {
        // Перепроверяем, мобильное ли устройство при изменении размера
        const wasMobile = this.isMobile;
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
        
        // Обновляем скорость анимации если изменился тип устройства
        if (wasMobile !== this.isMobile) {
            this.animationSpeed = this.isMobile ? 0.008 : 0.02;
        }
        
        this.init();
    }
    
    // Простая функция шума Перлина
    noise(x, y, z) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;
        
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);
        
        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);
        
        const A = this.p[X] + Y;
        const AA = this.p[A] + Z;
        const AB = this.p[A + 1] + Z;
        const B = this.p[X + 1] + Y;
        const BA = this.p[B] + Z;
        const BB = this.p[B + 1] + Z;
        
        return this.lerp(w, 
            this.lerp(v, 
                this.lerp(u, this.grad(this.p[AA], x, y, z), this.grad(this.p[BA], x - 1, y, z)),
                this.lerp(u, this.grad(this.p[AB], x, y - 1, z), this.grad(this.p[BB], x - 1, y - 1, z))
            ),
            this.lerp(v,
                this.lerp(u, this.grad(this.p[AA + 1], x, y, z - 1), this.grad(this.p[BA + 1], x - 1, y, z - 1)),
                this.lerp(u, this.grad(this.p[AB + 1], x, y - 1, z - 1), this.grad(this.p[BB + 1], x - 1, y - 1, z - 1))
            )
        );
    }
    
    fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    lerp(t, a, b) { return a + t * (b - a); }
    grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
    
    // Инициализация таблицы перестановок для шума Перлина
    initPerlin() {
        this.p = new Array(512);
        const permutation = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
        
        for (let i = 0; i < 256; i++) {
            this.p[256 + i] = this.p[i] = permutation[i];
        }
    }
    
    updateGlitchEffects() {
        // Обновляем счетчики глюков
        this.glitchEffects.symbolShift += 0.1;
        this.glitchEffects.randomFlicker += 0.15;
        this.glitchEffects.chaosBurst += 0.05;
        this.glitchEffects.matrixCorruption += 0.08;
        this.glitchEffects.symbolScramble += 0.12;
        
        // Обновляем зоны глюков
        for (let i = 0; i < this.glitchEffects.glitchZones.length; i++) {
            const zone = this.glitchEffects.glitchZones[i];
            zone.life--;
            
            if (zone.life <= 0) {
                // Создаем новую зону глюка
                zone.x = Math.floor(Math.random() * this.cols);
                zone.y = Math.floor(Math.random() * this.rows);
                zone.radius = Math.floor(Math.random() * 8) + 4;
                zone.intensity = Math.random() * 0.8 + 0.2;
                zone.type = Math.floor(Math.random() * 4);
                zone.life = Math.random() * 200 + 100;
            }
        }
        

    }
    
    applyGlitchEffects(x, y, brightness) {
        let glitchOffset = 0;
        let flickerIntensity = 0;
        let corruptionLevel = 0;
        let shouldScramble = false;
        
        // Проверяем, находится ли символ в зоне глюка
        for (const zone of this.glitchEffects.glitchZones) {
            const distance = Math.sqrt((x - zone.x) ** 2 + (y - zone.y) ** 2);
            if (distance < zone.radius) {
                const influence = (zone.radius - distance) / zone.radius * zone.intensity;
                
                switch(zone.type) {
                    case 0: // Сдвиг символов
                        glitchOffset += Math.sin(this.glitchEffects.symbolShift + distance) * influence * 3;
                        break;
                    case 1: // Мерцание
                        flickerIntensity += Math.sin(this.glitchEffects.randomFlicker + distance) * influence;
                        break;
                    case 2: // Коррупция матрицы
                        corruptionLevel += Math.sin(this.glitchEffects.matrixCorruption + distance) * influence;
                        break;
                    case 3: // Перемешивание символов
                        shouldScramble = Math.random() < influence * 0.3;
                        break;
                }
            }
        }
        
        // В обычной теме полностью отключаем эффекты
        glitchOffset = 0;
        flickerIntensity = 0;
        corruptionLevel = 0;
        shouldScramble = false;
        
        return { glitchOffset, flickerIntensity, corruptionLevel, shouldScramble };
    }
    
    draw() {
        // Полностью очищаем canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.font = `${this.fontSize}px "Courier New", monospace`;
        this.ctx.textBaseline = 'top';
        

        
        // Обновляем время для анимации (адаптивная скорость)
        this.time += this.animationSpeed;
        
        // Обновляем эффекты глюков
        this.updateGlitchEffects();
        
        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
                // Используем более простой шум без волн
                const noiseValue = this.noise(x * 0.05, y * 0.05, this.time * 0.1);
                
                // Преобразуем в яркость с более статичным результатом
                let brightness = (noiseValue + 1) * 0.5;
                
                // Делаем символы более активными
                brightness = Math.max(0.2, Math.min(0.9, brightness));
                
                // Применяем эффекты глюков
                const glitchEffects = this.applyGlitchEffects(x, y, brightness);
                
                // Создаем более активную прозрачность
                let alpha = brightness * 0.4;
                

                
                // Увеличиваем смену символов для большей активности
                const baseChangeRate = this.isMobile ? 0.0005 : 0.001;
                const brightChangeRate = this.isMobile ? 0.002 : 0.004;
                const changeRate = brightness > 0.7 ? brightChangeRate : baseChangeRate;
                
                // Увеличиваем вероятность смены символов только в зонах глюков
                const glitchChangeRate = changeRate * (1 + glitchEffects.corruptionLevel);
                
                if (Math.random() < glitchChangeRate || glitchEffects.shouldScramble) {
                    // Выбираем категорию символов в зависимости от яркости и позиции
                    let selectedCategory;
                    
                    if (brightness > 0.8) {
                        // Очень яркие области - природа и элементы
                        selectedCategory = Math.random() < 0.6 ? this.categories.nature : this.categories.elements;
                    } else if (brightness > 0.6) {
                        // Яркие области - эмоции и абстракции
                        selectedCategory = Math.random() < 0.5 ? this.categories.emotions : this.categories.abstract;
                    } else if (brightness > 0.4) {
                        // Средние области - время и пространство
                        selectedCategory = Math.random() < 0.5 ? this.categories.time : this.categories.space;
                    } else if (brightness > 0.2) {
                        // Темные области - тело и качества
                        selectedCategory = Math.random() < 0.5 ? this.categories.body : this.categories.qualities;
                    } else {
                        // Очень темные области - тонкие символы и числа
                        selectedCategory = Math.random() < 0.7 ? this.categories.thin : this.categories.numbers;
                    }
                    
                    this.grid[x][y].char = selectedCategory[Math.floor(Math.random() * selectedCategory.length)];
                }
                
                // Обычные бежевые оттенки
                const color = `rgba(168, 144, 116, ${alpha})`;
                
                this.ctx.fillStyle = color;
                
                // Позиция символа
                const drawX = x * this.fontSize;
                const drawY = y * this.fontSize;
                
                this.ctx.fillText(
                    this.grid[x][y].char,
                    drawX,
                    drawY
                );
                

            }
        }
    }
    

    
    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}



// ===== CAROUSEL FUNCTIONS =====
let currentSlide = 0;
let slides = [];
let indicators = [];
let autoSlideInterval = null;
let manualInteractionTimeout = null;

function showSlide(index) {
    // Получаем актуальные элементы
    slides = document.querySelectorAll('.carousel-slide');
    indicators = document.querySelectorAll('.indicator');
    
    // Скрываем все слайды
    slides.forEach(slide => {
        slide.classList.remove('active');
    });
    
    // Убираем активный класс у всех индикаторов
    indicators.forEach(indicator => {
        indicator.classList.remove('active');
    });
    
    // Показываем нужный слайд
    if (slides[index]) {
        slides[index].classList.add('active');
    }
    
    // Активируем соответствующий индикатор
    if (indicators[index]) {
        indicators[index].classList.add('active');
    }
    
    currentSlide = index;
}

function nextSlide() {
    const nextIndex = (currentSlide + 1) % slides.length;
    showSlide(nextIndex);
}

function prevSlide() {
    const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prevIndex);
}

function goToSlide(index) {
    showSlide(index);
}

// Функция для ручного управления с отключением автопереключения
function manualSlideChange(newIndex) {
    // Останавливаем автопереключение
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
    }
    
    // Очищаем предыдущий таймаут
    if (manualInteractionTimeout) {
        clearTimeout(manualInteractionTimeout);
    }
    
    // Показываем нужный слайд
    showSlide(newIndex);
    
    // Запускаем автопереключение через 20 секунд
    manualInteractionTimeout = setTimeout(() => {
        startAutoSlide();
    }, 20000);
}

// Автоматическое переключение слайдов каждые 5 секунд
function startAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
    }
    
    autoSlideInterval = setInterval(() => {
        nextSlide();
    }, 5000);
}



// ===== MODAL FUNCTIONS =====
function openModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    
    // Получаем активный слайд и его изображение
    const activeSlide = document.querySelector('.carousel-slide.active');
    const activeImage = activeSlide ? activeSlide.querySelector('.carousel-image') : null;
    
    // Используем изображение из активного слайда, учитывая lazy loading
    let correctImageSrc = imageSrc;
    if (activeImage) {
        // Проверяем, загружено ли изображение или есть data-src
        correctImageSrc = activeImage.src || activeImage.getAttribute('data-src') || imageSrc;
    }
    
    modalImage.src = correctImageSrc;
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    
    // Останавливаем автопереключение карусели
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
    }
}

function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
    
    // Возобновляем автопереключение карусели через 20 секунд
    if (manualInteractionTimeout) {
        clearTimeout(manualInteractionTimeout);
    }
    
    manualInteractionTimeout = setTimeout(() => {
        startAutoSlide();
    }, 20000);
}

// Закрытие модального окна по клавише Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// ===== LOADING LOGIC =====
function preloadImages() {
    const imageUrls = [
        'media/image/av.png'
    ];
    
    const imagePromises = imageUrls.map(url => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = () => reject(url);
            img.src = url;
        });
    });
    
    return Promise.all(imagePromises);
}

function initializeLazyLoading() {
    // Находим все изображения дизайнов
    const designImages = document.querySelectorAll('.carousel-image');
    
    // Создаем Intersection Observer для lazy loading
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.getAttribute('data-src');
                
                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    }, {
        rootMargin: '50px' // Начинаем загружать за 50px до появления
    });
    
    // Добавляем изображения под наблюдение
    designImages.forEach(img => {
        const src = img.src;
        img.setAttribute('data-src', src);
        img.src = ''; // Очищаем src
        imageObserver.observe(img);
    });
}

function initializeApp() {
    // Инициализируем матричный фон
    const matrixBackground = new MatrixPerlinBackground();
    window.matrixBackground = matrixBackground;
    
    // Инициализация карусели
    slides = document.querySelectorAll('.carousel-slide');
    indicators = document.querySelectorAll('.indicator');
    
    if (slides.length > 0) {
        showSlide(0);
        startAutoSlide();
    }
    
    // Инициализируем lazy loading для изображений дизайнов
    initializeLazyLoading();
    
    // Скрываем экран загрузки
    hideLoadingScreen();
}

// Запускаем загрузку при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    // Показываем экран загрузки
    showLoadingScreen();
    
    // Загружаем только аватарку и инициализируем приложение
    preloadImages()
        .then(() => {
            // Небольшая задержка для плавности
            setTimeout(() => {
                initializeApp();
            }, 300);
        })
        .catch((error) => {
            console.warn('Avatar failed to load:', error);
            // Все равно инициализируем приложение
            setTimeout(() => {
                initializeApp();
            }, 300);
        });
});