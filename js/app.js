var app = new Vue({
    el: '#app',
    data: {
        currentPage: 'home',
        orderConfirmed: false,
        isDarkMode: false,
        lessons: [],
        isLoading: true,
        cart: [],
        sortAttribute: 'subject',
        sortOrder: 'ascending',
        searchQuery: '',
        filterCategories: [],
        filterPriceMax: 2500,
        filterLocations: [],
        filterSeatsOptions: [],
        filterMinSeats: 0,
        filterCollapsed: true,
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
        previousPage: 'home',
        currentImageIndex: 0,

        apiURL: 'https://outsmart-backend-osm4.onrender.com/api',

        // Base URL for images (static files from backend)
        imageBaseURL: 'https://outsmart-backend-osm4.onrender.com/images',

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
        searchCompleted: false,

        // Search results (separate from lessons to not affect popular lessons)
        searchResults: null
    },
    watch: {
        currentPage: function () {
            window.scrollTo(0, 0);
        }
    },
    computed: {
        // Lessons to display on All Lessons page (uses search results if available)
        displayLessons: function () {
            return this.searchResults !== null ? this.searchResults : this.lessons;
        },
        sortedLessons: function () {
            let lessonsArray = this.displayLessons.slice();
            let self = this;

            // Apply filters
            if (this.filterCategories.length > 0) {
                lessonsArray = lessonsArray.filter(function(lesson) {
                    return self.filterCategories.indexOf(lesson.subject) !== -1;
                });
            }

            // Price filter - show lessons up to max price
            lessonsArray = lessonsArray.filter(function(lesson) {
                return lesson.price <= self.filterPriceMax;
            });

            if (this.filterLocations.length > 0) {
                lessonsArray = lessonsArray.filter(function(lesson) {
                    return self.filterLocations.indexOf(lesson.location) !== -1;
                });
            }

            // Seats filter - show lessons with at least filterMinSeats
            if (this.filterMinSeats > 0) {
                lessonsArray = lessonsArray.filter(function(lesson) {
                    return lesson.spaces >= self.filterMinSeats;
                });
            }

            // Sort lessons
            lessonsArray.sort(function(a, b) {
                let aValue = a[self.sortAttribute];
                let bValue = b[self.sortAttribute];

                // Handle string comparison
                if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }

                let comparison = 0;
                if (aValue < bValue) {
                    comparison = -1;
                } else if (aValue > bValue) {
                    comparison = 1;
                }

                return self.sortOrder === 'ascending' ? comparison : -comparison;
            });

            return lessonsArray;
        },
        uniqueLocations: function () {
            let locations = [];
            for (let i = 0; i < this.lessons.length; i++) {
                if (locations.indexOf(this.lessons[i].location) === -1) {
                    locations.push(this.lessons[i].location);
                }
            }
            return locations.sort();
        },
        uniqueCategories: function () {
            let categories = [];
            for (let i = 0; i < this.lessons.length; i++) {
                if (categories.indexOf(this.lessons[i].subject) === -1) {
                    categories.push(this.lessons[i].subject);
                }
            }
            return categories.sort();
        },
        maxPrice: function () {
            if (this.lessons.length === 0) return 2500;
            let max = 0;
            for (let i = 0; i < this.lessons.length; i++) {
                if (this.lessons[i].price > max) {
                    max = this.lessons[i].price;
                }
            }
            return max;
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
            return this.selectedLesson.description || 'Join us for an engaging and educational experience!';
        }
    },
    methods: {
        resetFilters: function () {
            this.filterCategories = [];
            this.filterPriceMax = 2500;
            this.filterLocations = [];
            this.filterSeatsOptions = [];
            this.filterMinSeats = 0;
        },
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
            // If search query is empty, clear search results
            if (!this.searchQuery || this.searchQuery.trim() === '') {
                this.searchResults = null;
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
                    this.searchResults = data;
                }.bind(this))
                .catch(function (error) {
                    console.error('Error searching lessons:', error);
                    alert('Search failed. Please try again.');
                });
        },
        searchLessonsWithSuggestions: function () {
            // If search query is empty, clear suggestions and search results
            if (!this.searchQuery || this.searchQuery.trim() === '') {
                this.searchSuggestions = [];
                this.searchCompleted = false;
                this.searchResults = null;
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
                    this.searchResults = data;
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
        clearSearch: function () {
            this.searchQuery = '';
            this.searchSuggestions = [];
            this.searchCompleted = false;
            this.showSuggestions = false;
            this.searchResults = null;
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

            // If cart is empty, go back to lessons page
            if (this.cart.length === 0) {
                this.currentPage = 'lessons';
            }
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
            this.isLoading = true;
            fetch(this.apiURL + '/lessons')
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error('Failed to fetch lessons');
                    }
                    return response.json();
                })
                .then(function (data) {
                    this.lessons = data;
                    this.isLoading = false;
                }.bind(this))
                .catch(function (error) {
                    console.error('Error fetching lessons:', error);
                    this.lessons = [];
                    this.isLoading = false;
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