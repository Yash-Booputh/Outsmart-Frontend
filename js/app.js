var app = new Vue({
    el: '#app',
    data: {
        currentPage: 'dashboard',
        orderConfirmed: false,
        isDarkMode: false,
        showLoginModal: false,
        isLoggedIn: false,
        loginMode: 'login',
        loginForm: {
            email: '',
            password: '',
            name: ''
        },
        leftPupilStyle: {},
        rightPupilStyle: {},
        leftInnerPupilStyle: {},
        rightInnerPupilStyle: {},
        mascotAdjust: {
            x: -162,
            y: -70.5,
            z: 2,
            size: 193
        },
        pupilControls: {
            leftEyeX: 28,
            leftEyeY: 28,
            rightEyeX: 33,
            rightEyeY: 28,
            outerSize: 31,
            innerSize: 30,
            innerOffsetX: 0,
            innerOffsetY: 0,
            moveRange: 13
        },
        lessons: [],
        cart: [],
        sortAttribute: 'subject',
        sortOrder: 'ascending',
        searchQuery: '',
        checkoutInfo: {
            name: '',
            phone: ''
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

        apiURL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'http://localhost:3000/api'
            : 'https://outsmart-backend-osm4.onrender.com/api'
    },
    computed: {
        mascotStyle: function () {
            return {
                width: this.mascotAdjust.size + 'px',
                height: this.mascotAdjust.size + 'px',
                transform: 'translateX(calc(-50% + ' + this.mascotAdjust.x + 'px)) translateY(' + this.mascotAdjust.y + 'px)',
                zIndex: this.mascotAdjust.z
            };
        },
        leftEyeStyle: function () {
            return {
                left: this.pupilControls.leftEyeX + '%',
                top: this.pupilControls.leftEyeY + '%'
            };
        },
        rightEyeStyle: function () {
            return {
                right: this.pupilControls.rightEyeX + '%',
                top: this.pupilControls.rightEyeY + '%'
            };
        },
        outerPupilStyle: function () {
            return {
                width: this.pupilControls.outerSize + '%',
                height: this.pupilControls.outerSize + '%'
            };
        },
        innerPupilStyle: function () {
            return {
                width: this.pupilControls.innerSize + '%',
                height: this.pupilControls.innerSize + '%',
                top: this.pupilControls.innerOffsetY + '%',
                left: this.pupilControls.innerOffsetX + '%'
            };
        },
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
        }
    },
    methods: {
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
        toggleLoginMode: function () {
            this.loginMode = this.loginMode === 'login' ? 'signup' : 'login';
            this.loginForm.email = '';
            this.loginForm.password = '';
            this.loginForm.name = '';
        },
        trackMouse: function (event) {
            let modalWrapper = event.currentTarget.querySelector('.login-modal-wrapper');
            if (!modalWrapper) return;

            let rect = modalWrapper.getBoundingClientRect();
            let mouseX = event.clientX;
            let mouseY = event.clientY;
            let mascotCenterX = rect.left + rect.width / 2 + this.mascotAdjust.x;
            let mascotCenterY = rect.top + this.mascotAdjust.y + this.mascotAdjust.size / 2;
            let leftEyeX = mascotCenterX + (this.mascotAdjust.size * (this.pupilControls.leftEyeX - 50) / 100);
            let leftEyeY = mascotCenterY + (this.mascotAdjust.size * (this.pupilControls.leftEyeY - 50) / 100);
            let rightEyeX = mascotCenterX + (this.mascotAdjust.size * (50 - this.pupilControls.rightEyeX) / 100);
            let rightEyeY = mascotCenterY + (this.mascotAdjust.size * (this.pupilControls.rightEyeY - 50) / 100);
            let leftAngle = Math.atan2(mouseY - leftEyeY, mouseX - leftEyeX);
            let maxDistance = this.mascotAdjust.size * 0.03;
            let leftDistance = Math.min(maxDistance, Math.hypot(mouseX - leftEyeX, mouseY - leftEyeY) * 0.1);
            let rightAngle = Math.atan2(mouseY - rightEyeY, mouseX - rightEyeX);
            let rightDistance = Math.min(maxDistance, Math.hypot(mouseX - rightEyeX, mouseY - rightEyeY) * 0.1);
            let leftOffsetX = Math.cos(leftAngle) * leftDistance;
            let leftOffsetY = Math.sin(leftAngle) * leftDistance;
            let rightOffsetX = Math.cos(rightAngle) * rightDistance;
            let rightOffsetY = Math.sin(rightAngle) * rightDistance;

            this.leftPupilStyle = {
                transform: 'translate(' + leftOffsetX + 'px, ' + leftOffsetY + 'px)'
            };

            this.rightPupilStyle = {
                transform: 'translate(' + rightOffsetX + 'px, ' + rightOffsetY + 'px)'
            };

            let innerLeftOffsetX = Math.cos(leftAngle) * leftDistance * 0.3;
            let innerLeftOffsetY = Math.sin(leftAngle) * leftDistance * 0.3;
            let innerRightOffsetX = Math.cos(rightAngle) * rightDistance * 0.3;
            let innerRightOffsetY = Math.sin(rightAngle) * rightDistance * 0.3;

            this.leftInnerPupilStyle = {
                transform: 'translate(' + innerLeftOffsetX + 'px, ' + innerLeftOffsetY + 'px)'
            };

            this.rightInnerPupilStyle = {
                transform: 'translate(' + innerRightOffsetX + 'px, ' + innerRightOffsetY + 'px)'
            };
        },
        hideMascot: function () {
            this.mascotAdjust.y = -18;
        },
        showMascot: function () {
            this.mascotAdjust.y = -71;
        },
        handleLogin: function () {
            if (this.loginMode === 'login') {
                if (this.loginForm.email && this.loginForm.password) {
                    console.log('Logging in:', this.loginForm.email);
                    this.isLoggedIn = true;
                    this.showLoginModal = false;
                    localStorage.setItem('isLoggedIn', 'true');

                    if (!this.userProfile.email) {
                        this.userProfile.email = this.loginForm.email;
                        localStorage.setItem('userProfile', JSON.stringify(this.userProfile));
                    }

                    this.loginForm.email = '';
                    this.loginForm.password = '';
                }
            } else {
                if (this.loginForm.name && this.loginForm.email && this.loginForm.password) {
                    console.log('Signing up:', this.loginForm.email);
                    this.isLoggedIn = true;
                    this.showLoginModal = false;
                    localStorage.setItem('isLoggedIn', 'true');

                    this.userProfile.name = this.loginForm.name;
                    this.userProfile.email = this.loginForm.email;
                    localStorage.setItem('userProfile', JSON.stringify(this.userProfile));

                    this.loginForm.name = '';
                    this.loginForm.email = '';
                    this.loginForm.password = '';
                }
            }
        },
        searchLessons: function() {
    // If search query is empty, fetch all lessons
    if (!this.searchQuery || this.searchQuery.trim() === '') {
        this.fetchLessons();
        return;
    }
    
    // Call backend search API (3% - Frontend fetch)
    fetch(this.apiURL + '/search?q=' + encodeURIComponent(this.searchQuery))
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Search failed');
            }
            return response.json();
        })
        .then(function(data) {
            this.lessons = data;
        }.bind(this))
        .catch(function(error) {
            console.error('Error searching lessons:', error);
            alert('Search failed. Please try again.');
        });
},
        logout: function () {
            this.isLoggedIn = false;
            localStorage.removeItem('isLoggedIn');
            this.cart = [];
            this.currentPage = 'dashboard';
        },
        addToCart: function (lesson) {
            if (!this.isLoggedIn) {
                this.showLoginModal = true;
                return;
            }

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
        checkout: function () {
            let orderData = {
                name: this.checkoutInfo.name,
                phone: this.checkoutInfo.phone,
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
                    for (let i = 0; i < this.cart.length; i++) {
                        let item = this.cart[i];
                        let lesson = this.lessons.find(function (l) {
                            return l._id === item.id;
                        });

                        if (lesson) {
                            this.updateLessonSpaces(item.id, lesson.spaces);
                        }
                    }

                    this.orderConfirmed = true;
                    this.cart = [];
                    this.checkoutInfo.name = '';
                    this.checkoutInfo.phone = '';
                }.bind(this))
                .catch(function (error) {
                    console.error('Error submitting order:', error);
                    alert('Failed to submit order. Please try again.');
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
                        { _id: '1', subject: 'Math', location: 'London', price: 100, spaces: 5, icon: 'fas fa-calculator' },
                        { _id: '2', subject: 'Math', location: 'Oxford', price: 100, spaces: 5, icon: 'fas fa-calculator' },
                        { _id: '3', subject: 'English', location: 'London', price: 100, spaces: 5, icon: 'fas fa-book' },
                        { _id: '4', subject: 'English', location: 'York', price: 90, spaces: 5, icon: 'fas fa-book' },
                        { _id: '5', subject: 'Music', location: 'Bristol', price: 90, spaces: 5, icon: 'fas fa-music' },
                        { _id: '6', subject: 'Science', location: 'Manchester', price: 95, spaces: 5, icon: 'fas fa-flask' },
                        { _id: '7', subject: 'Art', location: 'Liverpool', price: 85, spaces: 5, icon: 'fas fa-palette' },
                        { _id: '8', subject: 'History', location: 'Cambridge', price: 80, spaces: 5, icon: 'fas fa-landmark' },
                        { _id: '9', subject: 'Geography', location: 'Edinburgh', price: 75, spaces: 5, icon: 'fas fa-globe' },
                        { _id: '10', subject: 'PE', location: 'Birmingham', price: 70, spaces: 5, icon: 'fas fa-running' },
                        { _id: '11', subject: 'Drama', location: 'Leeds', price: 80, spaces: 5, icon: 'fas fa-theater-masks' },
                        { _id: '12', subject: 'IT', location: 'London', price: 110, spaces: 5, icon: 'fas fa-laptop-code' }
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

        let savedLogin = localStorage.getItem('isLoggedIn');
        if (savedLogin === 'true') {
            this.isLoggedIn = true;
        }

        let savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            this.userProfile = JSON.parse(savedProfile);
        }

        let savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
        }

        this.startSlideshow();
    },
    beforeDestroy: function () {
        this.stopSlideshow();
    }
});