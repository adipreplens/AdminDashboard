// PrepLens Website Integration
// Add this to your website (www.preplens.in)

class PrepLensAPI {
    constructor() {
        this.baseURL = 'https://admindashboard-x0hk.onrender.com/api/public';
        this.currentPage = 1;
        this.currentFilters = {};
    }

    // Fetch questions with filters
    async fetchQuestions(page = 1, filters = {}) {
        try {
            const params = new URLSearchParams({
                page: page,
                limit: 20,
                ...filters
            });

            const response = await fetch(`${this.baseURL}/questions?${params}`);
            const data = await response.json();

            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.error || 'Failed to fetch questions');
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            throw error;
        }
    }

    // Fetch question details
    async fetchQuestionDetails(questionId) {
        try {
            const response = await fetch(`${this.baseURL}/questions/${questionId}`);
            const data = await response.json();

            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.error || 'Failed to fetch question details');
            }
        } catch (error) {
            console.error('Error fetching question details:', error);
            throw error;
        }
    }

    // Fetch available filters
    async fetchFilters() {
        try {
            const response = await fetch(`${this.baseURL}/filters`);
            const data = await response.json();

            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.error || 'Failed to fetch filters');
            }
        } catch (error) {
            console.error('Error fetching filters:', error);
            throw error;
        }
    }

    // Fetch statistics
    async fetchStatistics() {
        try {
            const response = await fetch(`${this.baseURL}/statistics`);
            const data = await response.json();

            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.error || 'Failed to fetch statistics');
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
            throw error;
        }
    }
}

// Question Display Component
class QuestionDisplay {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.api = new PrepLensAPI();
        this.currentPage = 1;
        this.filters = {};
    }

    // Render questions
    async renderQuestions(page = 1, filters = {}) {
        try {
            this.showLoading();
            
            const data = await this.api.fetchQuestions(page, filters);
            this.currentPage = page;
            this.filters = filters;

            this.container.innerHTML = this.generateQuestionsHTML(data.questions);
            this.renderPagination(data.pagination);
            this.renderFilters();
        } catch (error) {
            this.showError('Failed to load questions. Please try again.');
        }
    }

    // Generate HTML for questions
    generateQuestionsHTML(questions) {
        if (!questions || questions.length === 0) {
            return '<div class="no-questions">No questions found. Try adjusting your filters.</div>';
        }

        return questions.map(question => `
            <div class="question-card" data-question-id="${question._id}">
                <div class="question-header">
                    <span class="subject">${question.subject || 'General'}</span>
                    <span class="exam">${question.exam || 'General'}</span>
                    <span class="difficulty ${question.difficulty?.toLowerCase()}">${question.difficulty || 'Basic'}</span>
                    ${question.isPremium ? '<span class="premium">Premium</span>' : ''}
                </div>
                
                <div class="question-content">
                    <h3 class="question-text">${this.sanitizeHTML(question.text)}</h3>
                    
                    ${question.questionMath ? `<div class="math-formula">${question.questionMath}</div>` : ''}
                    
                    ${question.imageUrl ? `<img src="${question.imageUrl}" alt="Question Image" class="question-image">` : ''}
                    
                    <div class="options">
                        ${this.generateOptionsHTML(question.options, question.optionImages)}
                    </div>
                </div>
                
                <div class="question-footer">
                    <button class="view-solution" onclick="questionDisplay.showSolution('${question._id}')">
                        View Solution
                    </button>
                    <button class="practice-question" onclick="questionDisplay.practiceQuestion('${question._id}')">
                        Practice
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Generate options HTML
    generateOptionsHTML(options, optionImages = {}) {
        if (!options || !Array.isArray(options)) return '';
        
        return options.map((option, index) => {
            const optionKey = `option${String.fromCharCode(65 + index)}`; // A, B, C, D
            const imageUrl = optionImages[optionKey];
            
            return `
                <div class="option">
                    <span class="option-label">${String.fromCharCode(65 + index)}.</span>
                    <span class="option-text">${this.sanitizeHTML(option)}</span>
                    ${imageUrl ? `<img src="${imageUrl}" alt="Option Image" class="option-image">` : ''}
                </div>
            `;
        }).join('');
    }

    // Render pagination
    renderPagination(pagination) {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) return;

        let paginationHTML = '<div class="pagination">';
        
        if (pagination.hasPrevPage) {
            paginationHTML += `<button onclick="questionDisplay.renderQuestions(${pagination.currentPage - 1}, questionDisplay.filters)">Previous</button>`;
        }
        
        paginationHTML += `<span class="current-page">Page ${pagination.currentPage} of ${pagination.totalPages}</span>`;
        
        if (pagination.hasNextPage) {
            paginationHTML += `<button onclick="questionDisplay.renderQuestions(${pagination.currentPage + 1}, questionDisplay.filters)">Next</button>`;
        }
        
        paginationHTML += '</div>';
        paginationContainer.innerHTML = paginationHTML;
    }

    // Render filters
    async renderFilters() {
        try {
            const filters = await this.api.fetchFilters();
            const filterContainer = document.getElementById('filters');
            if (!filterContainer) return;

            filterContainer.innerHTML = `
                <div class="filter-section">
                    <h3>Filters</h3>
                    <div class="filter-group">
                        <label>Subject:</label>
                        <select id="subject-filter" onchange="questionDisplay.applyFilters()">
                            <option value="">All Subjects</option>
                            ${filters.subjects.map(subject => `<option value="${subject}">${subject}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label>Exam:</label>
                        <select id="exam-filter" onchange="questionDisplay.applyFilters()">
                            <option value="">All Exams</option>
                            ${filters.exams.map(exam => `<option value="${exam}">${exam}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label>Difficulty:</label>
                        <select id="difficulty-filter" onchange="questionDisplay.applyFilters()">
                            <option value="">All Difficulties</option>
                            ${filters.difficulties.map(difficulty => `<option value="${difficulty}">${difficulty}</option>`).join('')}
                        </select>
                    </div>
                    
                    <button onclick="questionDisplay.clearFilters()">Clear Filters</button>
                </div>
            `;
        } catch (error) {
            console.error('Error rendering filters:', error);
        }
    }

    // Apply filters
    applyFilters() {
        const filters = {
            subject: document.getElementById('subject-filter')?.value,
            exam: document.getElementById('exam-filter')?.value,
            difficulty: document.getElementById('difficulty-filter')?.value
        };

        // Remove empty filters
        Object.keys(filters).forEach(key => {
            if (!filters[key]) delete filters[key];
        });

        this.renderQuestions(1, filters);
    }

    // Clear filters
    clearFilters() {
        document.getElementById('subject-filter').value = '';
        document.getElementById('exam-filter').value = '';
        document.getElementById('difficulty-filter').value = '';
        this.renderQuestions(1, {});
    }

    // Show solution
    async showSolution(questionId) {
        try {
            const question = await this.api.fetchQuestionDetails(questionId);
            
            const modal = document.createElement('div');
            modal.className = 'solution-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                    <h2>Solution</h2>
                    <div class="solution-content">
                        <p><strong>Correct Answer:</strong> ${question.answer}</p>
                        ${question.solution ? `<div class="solution-text">${this.sanitizeHTML(question.solution)}</div>` : ''}
                        ${question.solutionMath ? `<div class="math-formula">${question.solutionMath}</div>` : ''}
                        ${question.solutionImageUrl ? `<img src="${question.solutionImageUrl}" alt="Solution Image">` : ''}
                        ${question.explanation ? `<div class="explanation">${this.sanitizeHTML(question.explanation)}</div>` : ''}
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
        } catch (error) {
            alert('Failed to load solution. Please try again.');
        }
    }

    // Practice question
    practiceQuestion(questionId) {
        // Implement practice functionality
        alert('Practice functionality coming soon!');
    }

    // Show loading
    showLoading() {
        this.container.innerHTML = '<div class="loading">Loading questions...</div>';
    }

    // Show error
    showError(message) {
        this.container.innerHTML = `<div class="error">${message}</div>`;
    }

    // Sanitize HTML
    sanitizeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize question display
    window.questionDisplay = new QuestionDisplay('questions-container');
    
    // Load initial questions
    questionDisplay.renderQuestions();
    
    // Load statistics
    loadStatistics();
});

// Load statistics
async function loadStatistics() {
    try {
        const api = new PrepLensAPI();
        const stats = await api.fetchStatistics();
        
        const statsContainer = document.getElementById('statistics');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stats">
                    <div class="stat-item">
                        <h3>${stats.totalQuestions}</h3>
                        <p>Total Questions</p>
                    </div>
                    <div class="stat-item">
                        <h3>${stats.totalExams}</h3>
                        <p>Exams Covered</p>
                    </div>
                    <div class="stat-item">
                        <h3>${stats.totalSubjects}</h3>
                        <p>Subjects</p>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
} 