var app = new Vue({
    el: '#app',
    data: {
        currentPage: 'dashboard',
        orderConfirmed: false,
        isDarkMode: false,
        lessons: [],
        cart: [],
        sortAttribute: 'subject',
        sortOrder: 'ascending',
        searchQuery: '',
        checkoutInfo: {
            name: '',
            phone: '',
            email: ''
        },
        userProfile: {
            name: '',
            email: '',
            phone: '',
            studentId: '',
            address: ''
        },
        userProfileBackup: {},
        profileEditMode: false,
        passwordChange: {
            current: '',
            new: '',
            confirm: ''
        },
        settings: {
            emailNotifications: true,
            pushNotifications: false,
            marketingEmails: false,
            profileVisibility: true,
            showOnlineStatus: true,
            language: 'en',
            timezone: 'GMT'
        },
        currentSlide: 0,
        slideshowInterval: null,
        sidebarCollapsed: false,

        // Lesson detail page data
        selectedLesson: null,
        previousPage: 'dashboard',
        currentImageIndex: 0,

        apiURL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'http://localhost:3000/api'
            : 'https://outsmart-backend-osm4.onrender.com/api',

        // Base URL for images (static files from backend)
        imageBaseURL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'http://localhost:3000/images'
            : 'https://outsmart-backend-osm4.onrender.com/images',

        // Default includes for lessons without includes array
        defaultIncludes: [
            'Professional instruction',
            'All necessary equipment',
            'Progress tracking',
            'Certificate upon completion'
        ],

        // Search suggestions
        searchSuggestions: [],
        showSuggestions: false,
        searchCompleted: false
    },
    computed: {
        sortedLessons: function () {
            let lessonsArray = this.lessons.slice();

            // Don't filter here anymore - backend handles search
            // Just sort the lessons
            let attribute = this.sortAttribute;
            let order = this.sortOrder;

            lessonsArray.sort(function (a, b) {
                let valueA = a[attribute];
                let valueB = b[attribute];

                if (typeof valueA === 'string') {
                    valueA = valueA.toLowerCase();
                    valueB = valueB.toLowerCase();
                }

                if (order === 'ascending') {
                    return valueA > valueB ? 1 : (valueA < valueB ? -1 : 0);
                } else {
                    return valueA < valueB ? 1 : (valueA > valueB ? -1 : 0);
                }
            });

            return lessonsArray;
        },
        cartCount: function () {
            let total = 0;
            for (let i = 0; i < this.cart.length; i++) {
                total += this.cart[i].quantity;
            }
            return total;
        },
        cartTotal: function () {
            let total = 0;
            for (let i = 0; i < this.cart.length; i++) {
                total += this.cart[i].price * this.cart[i].quantity;
            }
            return total;
        },
        isValidName: function () {
            return /^[A-Za-z\s]+$/.test(this.checkoutInfo.name);
        },
        isValidPhone: function () {
            return /^[0-9]+$/.test(this.checkoutInfo.phone);
        },
        canCheckout: function () {
            return this.checkoutInfo.name !== '' &&
                this.checkoutInfo.phone !== '' &&
                this.isValidName &&
                this.isValidPhone &&
                this.cart.length > 0;
        },
        isValidProfileName: function () {
            return /^[A-Za-z\s]+$/.test(this.userProfile.name);
        },
        isValidProfilePhone: function () {
            return /^[0-9]+$/.test(this.userProfile.phone);
        },
        canSaveProfile: function () {
            if (!this.userProfile.name || !this.userProfile.email) {
                return false;
            }
            if (this.userProfile.name && !this.isValidProfileName) {
                return false;
            }
            if (this.userProfile.phone && !this.isValidProfilePhone) {
                return false;
            }
            return true;
        },
        canChangePassword: function () {
            return this.passwordChange.current !== '' &&
                this.passwordChange.new !== '' &&
                this.passwordChange.confirm !== '' &&
                this.passwordChange.new === this.passwordChange.confirm;
        },
        lessonImages: function () {
            if (!this.selectedLesson) return [];

            // Return the lesson's main image from backend
            var imageName = this.selectedLesson.image || 'default.jpg';
            var mainImage = this.imageBaseURL + '/' + imageName;
            return [mainImage];
        },
        lessonDescription: function () {
            if (!this.selectedLesson) return '';

            let descriptions = {
                'Math': 'Master the fundamentals of mathematics! From algebra to calculus, develop strong problem-solving skills and logical thinking in an engaging, supportive environment.',
                'English': 'Enhance your language skills through literature, creative writing, and critical analysis. Build confidence in communication and expression.',
                'Music': 'Discover the joy of music! Learn to read notation, play instruments, and understand music theory while developing your creative expression.',
                'Science': 'Explore the wonders of the natural world through hands-on experiments and discovery. Build a foundation in scientific inquiry and critical thinking.',
                'Art': 'Unleash your creativity! Learn various artistic techniques, from drawing to painting, and develop your unique artistic voice.',
                'History': 'Journey through time and explore the events that shaped our world. Develop critical thinking through analyzing historical sources and perspectives.',
                'Geography': 'Discover our world! Learn about landscapes, cultures, and environmental systems while developing spatial awareness and global understanding.',
                'PE': 'Get active and healthy! Develop physical fitness, teamwork skills, and sportsmanship through various sports and physical activities.',
                'Drama': 'Step into the spotlight! Build confidence, creativity, and communication skills through theatrical performance and improvisation.',
                'IT': 'Navigate the digital world! Learn programming, digital literacy, and technology skills essential for the modern age.',
                'French': 'Bonjour! Start your journey into the French language and culture. Learn practical conversation skills, vocabulary, and grammar in a lively, interactive setting.'
            };

            return descriptions[this.selectedLesson.subject] || 'Join us for an engaging and educational experience! Our expert instructors will guide you through comprehensive lessons designed to help you achieve your learning goals.';
        }
    },
    methods: {
        getImageUrl: function (imageName) {
            // Returns the full URL for a lesson image from the backend
            if (!imageName) {
                return this.imageBaseURL + '/default.jpg';
            }
            return this.imageBaseURL + '/' + imageName;
        },
        toggleTheme: function () {
            this.isDarkMode = !this.isDarkMode;
            if (this.isDarkMode) {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
            }
        },
        toggleSidebar: function () {
            this.sidebarCollapsed = !this.sidebarCollapsed;
            localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed);
        },
        handleResize: function () {
            if (window.innerWidth <= 992) {
                this.sidebarCollapsed = true;
            } else {
                let saved = localStorage.getItem('sidebarCollapsed');
                this.sidebarCollapsed = saved === 'true';
            }
        },
        searchLessons: function () {
            // If search query is empty, fetch all lessons
            if (!this.searchQuery || this.searchQuery.trim() === '') {
                this.fetchLessons();
                return;
            }

            // Call backend search API (3% - Frontend fetch)
            fetch(this.apiURL + '/search?q=' + encodeURIComponent(this.searchQuery))
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error('Search failed');
                    }
                    return response.json();
                })
                .then(function (data) {
                    this.lessons = data;
                }.bind(this))
                .catch(function (error) {
                    console.error('Error searching lessons:', error);
                    alert('Search failed. Please try again.');
                });
        },
        searchLessonsWithSuggestions: function () {
            // If search query is empty, clear suggestions and fetch all lessons
            if (!this.searchQuery || this.searchQuery.trim() === '') {
                this.searchSuggestions = [];
                this.searchCompleted = false;
                this.fetchLessons();
                return;
            }

            // Call backend search API for suggestions
            fetch(this.apiURL + '/search?q=' + encodeURIComponent(this.searchQuery))
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error('Search failed');
                    }
                    return response.json();
                })
                .then(function (data) {
                    this.searchSuggestions = data.slice(0, 5); // Limit to 5 suggestions
                    this.lessons = data;
                    this.searchCompleted = true;
                }.bind(this))
                .catch(function (error) {
                    console.error('Error searching lessons:', error);
                    this.searchSuggestions = [];
                    this.searchCompleted = true;
                });
        },
        selectSuggestion: function (lesson) {
            this.searchQuery = lesson.subject;
            this.searchSuggestions = [];
            this.showSuggestions = false;
            this.viewLesson(lesson);
        },
        hideSuggestionsDelayed: function () {
            var self = this;
            setTimeout(function () {
                self.showSuggestions = false;
            }, 200);
        },
        viewLesson: function (lesson) {
            this.selectedLesson = lesson;
            this.previousPage = this.currentPage;
            this.currentImageIndex = 0;
            this.currentPage = 'lessonDetail';
        },
        addToCart: function (lesson) {
            if (lesson.spaces === 0) return;

            let found = false;
            for (let i = 0; i < this.cart.length; i++) {
                if (this.cart[i].id === lesson._id) {
                    this.cart[i].quantity++;
                    found = true;
                    break;
                }
            }

            if (!found) {
                this.cart.push({
                    id: lesson._id,
                    subject: lesson.subject,
                    location: lesson.location,
                    price: lesson.price,
                    icon: lesson.icon,
                    quantity: 1
                });
            }

            lesson.spaces--;
        },
        removeFromCart: function (index) {
            let item = this.cart[index];

            for (let i = 0; i < this.lessons.length; i++) {
                if (this.lessons[i]._id === item.id) {
                    this.lessons[i].spaces += item.quantity;
                    break;
                }
            }

            this.cart.splice(index, 1);
        },
        increaseQuantity: function (index) {
            let item = this.cart[index];

            // Find the lesson and check if there are available spaces
            for (let i = 0; i < this.lessons.length; i++) {
                if (this.lessons[i]._id === item.id) {
                    if (this.lessons[i].spaces > 0) {
                        item.quantity++;
                        this.lessons[i].spaces--;
                    }
                    break;
                }
            }
        },
        decreaseQuantity: function (index) {
            let item = this.cart[index];

            if (item.quantity > 1) {
                item.quantity--;
                // Restore space to the lesson
                for (let i = 0; i < this.lessons.length; i++) {
                    if (this.lessons[i]._id === item.id) {
                        this.lessons[i].spaces++;
                        break;
                    }
                }
            }
        },
        getAvailableSpaces: function (itemId) {
            for (let i = 0; i < this.lessons.length; i++) {
                if (this.lessons[i]._id === itemId) {
                    return this.lessons[i].spaces;
                }
            }
            return 0;
        },
        checkout: function () {
            let orderData = {
                name: this.checkoutInfo.name,
                phone: this.checkoutInfo.phone,
                email: this.checkoutInfo.email,
                lessonIDs: [],
                spaces: []
            };

            for (let i = 0; i < this.cart.length; i++) {
                orderData.lessonIDs.push(this.cart[i].id);
                orderData.spaces.push(this.cart[i].quantity);
            }

            // POST to backend (4%)
            fetch(this.apiURL + '/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            })
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error('Order submission failed');
                    }
                    return response.json();
                })
                .then(function (data) {
                    console.log('Order submitted:', data);

                    // Update lesson spaces in backend (3%)
                    // For EACH item in cart, update the spaces
                    let updatePromises = [];

                    for (let i = 0; i < this.cart.length; i++) {
                        let item = this.cart[i];
                        let lesson = this.lessons.find(function (l) {
                            return l._id === item.id;
                        });

                        if (lesson) {
                            // Calculate NEW spaces (current spaces is already reduced in frontend)
                            let newSpaces = lesson.spaces;

                            console.log(`Updating lesson ${item.id}: spaces = ${newSpaces}`);

                            // Create update promise
                            let updatePromise = fetch(this.apiURL + '/lessons/' + item.id, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ spaces: newSpaces })
                            })
                                .then(function (response) {
                                    if (!response.ok) {
                                        throw new Error('Failed to update lesson spaces');
                                    }
                                    return response.json();
                                });

                            updatePromises.push(updatePromise);
                        }
                    }

                    // Wait for all updates to complete
                    return Promise.all(updatePromises);
                }.bind(this))
                .then(function () {
                    console.log('All lesson spaces updated successfully');

                    this.orderConfirmed = true;
                    this.cart = [];
                    this.checkoutInfo.name = '';
                    this.checkoutInfo.phone = '';
                    this.checkoutInfo.email = '';
                }.bind(this))
                .catch(function (error) {
                    console.error('Error during checkout:', error);
                    alert('Checkout failed. Please try again.');
                });
        },
        updateLessonSpaces: function (lessonId, newSpaces) {
            // PUT to update spaces (3%)
            fetch(this.apiURL + '/lessons/' + lessonId, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ spaces: newSpaces })
            })
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error('Failed to update lesson spaces');
                    }
                    return response.json();
                })
                .then(function (data) {
                    console.log('Lesson spaces updated:', data);
                })
                .catch(function (error) {
                    console.error('Error updating lesson spaces:', error);
                });
        },
        fetchLessons: function () {
            // GET lessons from backend (3%)
            fetch(this.apiURL + '/lessons')
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error('Failed to fetch lessons');
                    }
                    return response.json();
                })
                .then(function (data) {
                    this.lessons = data;
                }.bind(this))
                .catch(function (error) {
                    console.error('Error fetching lessons:', error);
                    // Fallback to hardcoded data when backend is not available (e.g., on GitHub Pages before AWS deployment)
                    this.lessons = [
                        { _id: '1', subject: 'Mathematics', location: 'Port Louis', price: 1500, spaces: 5, icon: 'fas fa-calculator', image: 'math.jpg', rating: 4 },
                        { _id: '2', subject: 'English Literature', location: 'Curepipe', price: 1200, spaces: 5, icon: 'fas fa-book', image: 'english.jpg', rating: 5 },
                        { _id: '3', subject: 'Music Theory', location: 'Quatre Bornes', price: 1800, spaces: 5, icon: 'fas fa-music', image: 'music.jpg', rating: 4 },
                        { _id: '4', subject: 'Science', location: 'Rose Hill', price: 1600, spaces: 5, icon: 'fas fa-flask', image: 'science.jpg', rating: 5 },
                        { _id: '5', subject: 'Art & Design', location: 'Vacoas', price: 1400, spaces: 5, icon: 'fas fa-palette', image: 'art.jpg', rating: 4 },
                        { _id: '6', subject: 'History', location: 'Beau Bassin', price: 1100, spaces: 5, icon: 'fas fa-landmark', image: 'history.jpg', rating: 3 },
                        { _id: '7', subject: 'Geography', location: 'Mahebourg', price: 1000, spaces: 5, icon: 'fas fa-globe', image: 'geography.jpg', rating: 4 },
                        { _id: '8', subject: 'Physical Education', location: 'Flic en Flac', price: 900, spaces: 5, icon: 'fas fa-running', image: 'pe.jpg', rating: 5 },
                        { _id: '9', subject: 'Drama & Theatre', location: 'Grand Baie', price: 1300, spaces: 5, icon: 'fas fa-theater-masks', image: 'drama.jpg', rating: 4 },
                        { _id: '10', subject: 'Computer Science', location: 'Ebene', price: 2000, spaces: 5, icon: 'fas fa-laptop-code', image: 'it.jpg', rating: 5 },
                        { _id: '11', subject: 'French Language', location: 'Port Louis', price: 1400, spaces: 5, icon: 'fas fa-language', image: 'french.jpg', rating: 4 },
                        { _id: '12', subject: 'Swimming', location: 'Pereybere', price: 1700, spaces: 5, icon: 'fas fa-swimmer', image: 'swimming.jpg', rating: 5 }
                    ];
                }.bind(this));
        },
        enableProfileEdit: function () {
            this.userProfileBackup = JSON.parse(JSON.stringify(this.userProfile));
            this.profileEditMode = true;
        },
        cancelProfileEdit: function () {
            this.userProfile = JSON.parse(JSON.stringify(this.userProfileBackup));
            this.profileEditMode = false;
        },
        saveProfile: function () {
            if (!this.canSaveProfile) {
                return;
            }

            localStorage.setItem('userProfile', JSON.stringify(this.userProfile));
            this.profileEditMode = false;

            alert('Profile updated successfully!');
        },
        changePassword: function () {
            if (!this.canChangePassword) {
                return;
            }

            console.log('Password changed successfully');
            alert('Password updated successfully!');

            this.passwordChange.current = '';
            this.passwordChange.new = '';
            this.passwordChange.confirm = '';
        },
        saveSettings: function () {
            localStorage.setItem('userSettings', JSON.stringify(this.settings));
            alert('Settings saved successfully!');
        },
        resetSettings: function () {
            this.settings = {
                emailNotifications: true,
                pushNotifications: false,
                marketingEmails: false,
                profileVisibility: true,
                showOnlineStatus: true,
                language: 'en',
                timezone: 'GMT'
            };
            localStorage.setItem('userSettings', JSON.stringify(this.settings));
            alert('Settings reset to default!');
        },
        startSlideshow: function () {
            var self = this;
            this.slideshowInterval = setInterval(function () {
                self.currentSlide = (self.currentSlide + 1) % 4;
            }, 4000);
        },
        stopSlideshow: function () {
            if (this.slideshowInterval) {
                clearInterval(this.slideshowInterval);
            }
        }
    },
    created: function () {
        // Fetch lessons from backend on app load
        this.fetchLessons();

        let savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            this.isDarkMode = true;
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        let savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
        }

        // Initialize sidebar state
        this.handleResize();
        window.addEventListener('resize', this.handleResize);

        this.startSlideshow();
    },
    beforeDestroy: function () {
        this.stopSlideshow();
        window.removeEventListener('resize', this.handleResize);
    }
});