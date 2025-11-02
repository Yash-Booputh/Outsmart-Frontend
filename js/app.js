var app = new Vue({
    el: '#app',
    data: {
        currentPage: 'dashboard',
        lessons: [],
        cart: [],
        isDarkMode: false,
        sortAttribute: 'subject',
        sortOrder: 'ascending',
        searchQuery: ''
    },
    computed: {
        cartCount: function() {
            let total = 0;
            for (let i = 0; i < this.cart.length; i++) {
                total += this.cart[i].quantity;
            }
            return total;
        },
        cartTotal: function() {
            let total = 0;
            for (let i = 0; i < this.cart.length; i++) {
                total += this.cart[i].price * this.cart[i].quantity;
            }
            return total;
        }
    },
    methods: {
        fetchLessons: function() {
            // Temporary hardcoded data - will be replaced with fetch
            this.lessons = [
                { id: 1, subject: 'Math', location: 'London', price: 100, spaces: 5, icon: 'fas fa-calculator' },
                { id: 2, subject: 'Math', location: 'Oxford', price: 100, spaces: 5, icon: 'fas fa-calculator' },
                { id: 3, subject: 'English', location: 'London', price: 100, spaces: 5, icon: 'fas fa-book' },
                { id: 4, subject: 'English', location: 'York', price: 90, spaces: 5, icon: 'fas fa-book' },
                { id: 5, subject: 'Music', location: 'Bristol', price: 90, spaces: 5, icon: 'fas fa-music' },
                { id: 6, subject: 'Science', location: 'Manchester', price: 95, spaces: 5, icon: 'fas fa-flask' },
                { id: 7, subject: 'Art', location: 'Liverpool', price: 85, spaces: 5, icon: 'fas fa-palette' },
                { id: 8, subject: 'History', location: 'Cambridge', price: 80, spaces: 5, icon: 'fas fa-landmark' },
                { id: 9, subject: 'Geography', location: 'Edinburgh', price: 75, spaces: 5, icon: 'fas fa-globe' },
                { id: 10, subject: 'PE', location: 'Birmingham', price: 70, spaces: 5, icon: 'fas fa-running' },
                { id: 11, subject: 'Drama', location: 'Leeds', price: 80, spaces: 5, icon: 'fas fa-theater-masks' },
                { id: 12, subject: 'IT', location: 'London', price: 110, spaces: 5, icon: 'fas fa-laptop-code' }
            ];
        }
    },
    created: function() {
        this.fetchLessons();

        // Load theme from localStorage
        let savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            this.isDarkMode = true;
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    },

    logout: function() {
            console.log('Logging out...');
            this.cart = [];
            this.currentPage = 'dashboard';
        },

        toggleTheme: function() {
            this.isDarkMode = !this.isDarkMode;
            if (this.isDarkMode) {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
            }
        },
        addToCart: function(lesson) {
            if (lesson.spaces === 0) return;
            
            let found = false;
            for (let i = 0; i < this.cart.length; i++) {
                if (this.cart[i].id === lesson.id) {
                    this.cart[i].quantity++;
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                this.cart.push({
                    id: lesson.id,
                    subject: lesson.subject,
                    location: lesson.location,
                    price: lesson.price,
                    icon: lesson.icon,
                    quantity: 1
                });
            }
            
            lesson.spaces--;
        },

        sortedLessons: function() {
            let lessonsArray = this.lessons.slice();
            
            if (this.searchQuery) {
                let query = this.searchQuery.toLowerCase();
                lessonsArray = lessonsArray.filter(function(lesson) {
                    return lesson.subject.toLowerCase().includes(query) ||
                           lesson.location.toLowerCase().includes(query) ||
                           lesson.price.toString().includes(query) ||
                           lesson.spaces.toString().includes(query);
                });
            }
            
            let attribute = this.sortAttribute;
            let order = this.sortOrder;
            
            lessonsArray.sort(function(a, b) {
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
         removeFromCart: function(index) {
            let item = this.cart[index];
            
            for (let i = 0; i < this.lessons.length; i++) {
                if (this.lessons[i].id === item.id) {
                    this.lessons[i].spaces += item.quantity;
                    break;
                }
            }
            
            this.cart.splice(index, 1);
        }
});