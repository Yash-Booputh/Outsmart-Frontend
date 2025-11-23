var app = new Vue({
    el: '#app',
    data: {
        // Page navigation
        currentPage: 'home',
        orderConfirmed: false,
        isDarkMode: false,

        // Lessons data
        lessons: [],
        isLoading: true,

        // Shopping cart
        cart: [],

        // Sorting and filtering
        sortAttribute: 'subject',
        sortOrder: 'ascending',
        searchQuery: '',
        filterCategories: [],
        filterPriceMax: 2500,
        filterLocations: [],
        filterMinSeats: 0,
        filterCollapsed: true,

        // Checkout form
        checkoutInfo: {
            name: '',
            phone: '',
            email: ''
        },

        // Slideshow
        currentSlide: 0,
        slideshowInterval: null,

        // Sidebar
        sidebarCollapsed: false,

        // Lesson detail page
        selectedLesson: null,
        previousPage: 'home',
        currentImageIndex: 0,

        // API URL for backend
        apiURL: 'https://outsmart-backend-osm4.onrender.com/api',

        // Base URL for images from backend
        imageBaseURL: 'https://outsmart-backend-osm4.onrender.com/images',

        // Default includes for lesson detail page
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

        // Search results (separate from lessons)
        searchResults: null
    },
    computed: {
        // Returns lessons to display (search results or all lessons)
        displayLessons: function () {
            return this.searchResults !== null ? this.searchResults : this.lessons;
        },

        // Returns filtered and sorted lessons for display
        sortedLessons: function () {
            let lessonsArray = this.displayLessons.slice();
            let self = this;

            // Filter by category
            if (this.filterCategories.length > 0) {
                lessonsArray = lessonsArray.filter(function(lesson) {
                    return self.filterCategories.indexOf(lesson.subject) !== -1;
                });
            }

            // Filter by max price
            lessonsArray = lessonsArray.filter(function(lesson) {
                return lesson.price <= self.filterPriceMax;
            });

            // Filter by location
            if (this.filterLocations.length > 0) {
                lessonsArray = lessonsArray.filter(function(lesson) {
                    return self.filterLocations.indexOf(lesson.location) !== -1;
                });
            }

            // Filter by minimum seats
            if (this.filterMinSeats > 0) {
                lessonsArray = lessonsArray.filter(function(lesson) {
                    return lesson.spaces >= self.filterMinSeats;
                });
            }

            // Sort lessons
            lessonsArray.sort(function(a, b) {
                let aValue = a[self.sortAttribute];
                let bValue = b[self.sortAttribute];

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

        // Gets unique locations from lessons for filter
        uniqueLocations: function () {
            let locations = [];
            for (let i = 0; i < this.lessons.length; i++) {
                if (locations.indexOf(this.lessons[i].location) === -1) {
                    locations.push(this.lessons[i].location);
                }
            }
            return locations.sort();
        },

        // Gets unique categories from lessons for filter
        uniqueCategories: function () {
            let categories = [];
            for (let i = 0; i < this.lessons.length; i++) {
                if (categories.indexOf(this.lessons[i].subject) === -1) {
                    categories.push(this.lessons[i].subject);
                }
            }
            return categories.sort();
        },

        // Gets maximum price from lessons for price slider
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

        // Returns total number of items in cart
        cartCount: function () {
            let total = 0;
            for (let i = 0; i < this.cart.length; i++) {
                total += this.cart[i].quantity;
            }
            return total;
        },

        // Returns total price of cart items
        cartTotal: function () {
            let total = 0;
            for (let i = 0; i < this.cart.length; i++) {
                total += this.cart[i].price * this.cart[i].quantity;
            }
            return total;
        },

        // Validates name contains only letters
        isValidName: function () {
            return /^[A-Za-z\s]+$/.test(this.checkoutInfo.name);
        },

        // Validates phone contains only numbers
        isValidPhone: function () {
            return /^[0-9]+$/.test(this.checkoutInfo.phone);
        },

        // Checks if checkout form is valid
        canCheckout: function () {
            return this.checkoutInfo.name !== '' &&
                this.checkoutInfo.phone !== '' &&
                this.isValidName &&
                this.isValidPhone &&
                this.cart.length > 0;
        },

        // Returns images for lesson detail page
        lessonImages: function () {
            if (!this.selectedLesson) return [];
            var imageName = this.selectedLesson.image || 'default.jpg';
            var mainImage = this.imageBaseURL + '/' + imageName;
            return [mainImage];
        },

        // Returns description for lesson detail page
        lessonDescription: function () {
            if (!this.selectedLesson) return '';
            return this.selectedLesson.description || 'Join us for an engaging and educational experience!';
        }
    },
    methods: {
        // Navigates to specified page
        navigateTo: function (page) {
            if (page !== 'lessons') {
                this.filterCollapsed = true;
            }
            this.currentPage = page;
            window.scrollTo(0, 0);
        },

        // Resets all filters to default values
        resetFilters: function () {
            this.filterCategories = [];
            this.filterPriceMax = 2500;
            this.filterLocations = [];
            this.filterMinSeats = 0;
            this.sortAttribute = 'subject';
            this.sortOrder = 'ascending';
        },

        // Returns full URL for lesson image
        getImageUrl: function (imageName) {
            if (!imageName) {
                return this.imageBaseURL + '/default.jpg';
            }
            return this.imageBaseURL + '/' + imageName;
        },

        // Toggles dark/light theme
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

        // Toggles sidebar collapsed state
        toggleSidebar: function () {
            this.sidebarCollapsed = !this.sidebarCollapsed;
            localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed);
        },

        // Handles window resize for responsive sidebar
        handleResize: function () {
            if (window.innerWidth <= 992) {
                this.sidebarCollapsed = true;
            } else {
                let saved = localStorage.getItem('sidebarCollapsed');
                this.sidebarCollapsed = saved === 'true';
            }
        },

        // Searches lessons and shows dropdown suggestions (search-as-you-type)
        searchLessonsWithSuggestions: function () {
            if (!this.searchQuery || this.searchQuery.trim() === '') {
                this.searchSuggestions = [];
                this.searchCompleted = false;
                this.searchResults = null;
                this.showSuggestions = false;
                return;
            }

            var currentQuery = this.searchQuery;
            this.showSuggestions = true;

            // Fetch search results from backend
            fetch(this.apiURL + '/search?q=' + encodeURIComponent(this.searchQuery))
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error('Search failed');
                    }
                    return response.json();
                })
                .then(function (data) {
                    if (this.searchQuery === currentQuery) {
                        this.searchSuggestions = data.slice(0, 5);
                        this.searchResults = data;
                        this.searchCompleted = true;
                        this.showSuggestions = true;
                    }
                }.bind(this))
                .catch(function (error) {
                    console.error('Error searching lessons:', error);
                    if (this.searchQuery === currentQuery) {
                        this.searchSuggestions = [];
                        this.searchCompleted = true;
                    }
                }.bind(this));
        },

        // Selects a suggestion from dropdown and views lesson
        selectSuggestion: function (lesson) {
            this.searchQuery = lesson.subject;
            this.searchSuggestions = [];
            this.showSuggestions = false;
            this.viewLesson(lesson);
        },

        // Hides suggestions dropdown with delay
        hideSuggestionsDelayed: function () {
            var self = this;
            setTimeout(function () {
                self.showSuggestions = false;
            }, 200);
        },

        // Clears search query and results
        clearSearch: function () {
            this.searchQuery = '';
            this.searchSuggestions = [];
            this.searchCompleted = false;
            this.showSuggestions = false;
            this.searchResults = null;
        },

        // Opens lesson detail page
        viewLesson: function (lesson) {
            this.selectedLesson = lesson;
            this.previousPage = this.currentPage;
            this.currentImageIndex = 0;
            this.currentPage = 'lessonDetail';
        },

        // Adds lesson to cart and decreases available spaces
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
                    image: lesson.image,
                    quantity: 1
                });
            }

            lesson.spaces--;
        },

        // Removes item from cart and restores spaces
        removeFromCart: function (index) {
            let item = this.cart[index];

            for (let i = 0; i < this.lessons.length; i++) {
                if (this.lessons[i]._id === item.id) {
                    this.lessons[i].spaces += item.quantity;
                    break;
                }
            }

            this.cart.splice(index, 1);

            if (this.cart.length === 0) {
                this.currentPage = 'lessons';
            }
        },

        // Increases quantity of cart item
        increaseQuantity: function (index) {
            let item = this.cart[index];

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

        // Decreases quantity of cart item
        decreaseQuantity: function (index) {
            let item = this.cart[index];

            if (item.quantity > 1) {
                item.quantity--;
                for (let i = 0; i < this.lessons.length; i++) {
                    if (this.lessons[i]._id === item.id) {
                        this.lessons[i].spaces++;
                        break;
                    }
                }
            }
        },

        // Gets available spaces for a lesson by ID
        getAvailableSpaces: function (itemId) {
            for (let i = 0; i < this.lessons.length; i++) {
                if (this.lessons[i]._id === itemId) {
                    return this.lessons[i].spaces;
                }
            }
            return 0;
        },

        // Submits order to backend and updates lesson spaces
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

            // POST order to backend
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

                    // PUT to update lesson spaces in backend
                    let updatePromises = [];

                    for (let i = 0; i < this.cart.length; i++) {
                        let item = this.cart[i];
                        let lesson = this.lessons.find(function (l) {
                            return l._id === item.id;
                        });

                        if (lesson) {
                            let newSpaces = lesson.spaces;

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

        // Updates lesson spaces in backend (PUT) 
        updateLessonSpaces: function (lessonId, newSpaces) {
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

        // Fetches all lessons from backend (GET)
        fetchLessons: function () {
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

        // Starts automatic slideshow on home page
        startSlideshow: function () {
            var self = this;
            this.slideshowInterval = setInterval(function () {
                self.currentSlide = (self.currentSlide + 1) % 4;
            }, 4000);
        },

        // Stops slideshow interval
        stopSlideshow: function () {
            if (this.slideshowInterval) {
                clearInterval(this.slideshowInterval);
            }
        }
    },
    created: function () {
        // Fetch lessons on app load
        this.fetchLessons();

        // Load saved theme preference
        let savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            this.isDarkMode = true;
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        // Initialize sidebar state
        this.handleResize();
        window.addEventListener('resize', this.handleResize);

        // Start slideshow
        this.startSlideshow();
    },
    beforeDestroy: function () {
        this.stopSlideshow();
        window.removeEventListener('resize', this.handleResize);
    }
});
