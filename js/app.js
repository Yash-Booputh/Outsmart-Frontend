var app = new Vue({
    el: '#app',
    data: {
        currentPage: 'dashboard',
        lessons: [],
        cart: [],
        isDarkMode: false
    },
    computed: {
        cartCount: function() {
            let total = 0;
            for (let i = 0; i < this.cart.length; i++) {
                total += this.cart[i].quantity;
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
        }
});