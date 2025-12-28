// Dữ liệu bài viết tạm thời (sẽ thay bằng database sau)
const blogPosts = [
    {
        id: 1,
        title: 'Nhiều người trẻ theo đuổi trào lưu sống tích cực trong năm mới',
        author: 'LÂM THẢO',
        date: 'OCTOBER 9, 2025',
        category: ['LoiSong', 'TamLy'],
        image: 'imgs/anhBlog1.jpg',
        description: 'Trong bối cảnh nhiều người trẻ chuyển đổi về tư duy nhân thức, thương hiệu Trung Nguyễn Legend đã đưa ra thông điệp "Lối sống Cà phê - Lối sống Thành công - Lối sống Tích cực", tạo ra hương thơm trong công đồng...',
        content: 'Nội dung đầy đủ của bài viết sẽ được hiển thị ở trang chi tiết bài viết...'
    },
    {
        id: 2,
        title: 'Xu hướng đọc sách của người trẻ Việt Nam năm 2025',
        author: 'NGUYỄN VĂN A',
        date: 'OCTOBER 15, 2025',
        category: ['DoiSong', 'KienThuc'],
        image: 'imgs/anhBlog2.jpg',
        description: 'Theo các nghiên cứu gần đây, số lượng người trẻ Việt Nam yêu thích đọc sách đang tăng đáng kể. Các thể loại sách tự giúp đỡ, phát triển bản thân đang dẫn đầu trong danh sách bán chạy...',
        content: 'Nội dung đầy đủ của bài viết sẽ được hiển thị ở trang chi tiết bài viết...'
    },
    {
        id: 3,
        title: 'Cách tạo thói quen đọc sách hiệu quả cho bản thân',
        author: 'TRẦN THỊ B',
        date: 'OCTOBER 20, 2025',
        category: ['KhoaHoc', 'SucKhoe'],
        image: 'imgs/anhBlog3.jpg',
        description: 'Đọc sách là một trong những cách tốt nhất để học hỏi và phát triển bản thân. Nhưng làm sao để tạo thói quen đọc sách mỗi ngày? Bài viết này sẽ chia sẻ một số bí quyết hữu ích...',
        content: 'Nội dung đầy đủ của bài viết sẽ được hiển thị ở trang chi tiết bài viết...'
    },
    {
        id: 4,
        title: 'Top 10 cuốn sách hay nhất năm 2025 không nên bỏ qua',
        author: 'LÊ MINH C',
        date: 'OCTOBER 25, 2025',
        category: ['DoiSong', 'CongNghe'],
        image: 'imgs/anhBlog4.jpg',
        description: 'Dưới đây là danh sách 10 cuốn sách xuất sắc nhất được phát hành trong năm 2025. Từ tiểu thuyết hấp dẫn đến sách tự giúp đỡ, tất cả đều xứng đáng nằm trong thư viện của bạn...',
        content: 'Nội dung đầy đủ của bài viết sẽ được hiển thị ở trang chi tiết bài viết...'
    }
];

// Render blog posts lên trang
document.addEventListener('DOMContentLoaded', function() {
    const blogContainer = document.getElementById('blogContainer');
    
    if (blogContainer) {
        blogPosts.forEach(post => {
            // Render categories
            const categoriesHtml = post.category.map(cat => `<span class="blog-category">#${cat}</span>`).join('');
            
            const blogPostHTML = `
                <article class="blog-post">
                    <div class="blog-content">
                        <h2 class="blog-title" onclick="readFullPost(${post.id})" style="cursor: pointer;">${post.title}</h2>
                        <p class="blog-meta">Published ${post.date} - By ${post.author}</p>
                        <div class="blog-categories">
                            ${categoriesHtml}
                        </div>
                        <p class="blog-description">${post.description}</p>
                        <div class="blog-actions">
                            <a href="#" class="btn-read-more" onclick="readFullPost(${post.id}); return false;">Đọc toàn bộ bài viết</a>
                            <div class="btn-group">
                                <button type="button" class="btn-like" onclick="likeBlogPost(${post.id}, this)" title="Thích bài viết"><img src="imgs/heart_null.png" alt="Like" style="width: 20px; height: 20px;"></button>
                                <button type="button" class="btn-save" onclick="saveBlogPost(${post.id}, this)" title="Lưu bài viết"><img src="imgs/save.png" alt="Save" style="width: 20px; height: 20px;"></button>
                            </div>
                        </div>
                    </div>
                    <div class="blog-image">
                        <img src="${post.image}" alt="${post.title}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                </article>
            `;
            blogContainer.innerHTML += blogPostHTML;
        });
    }
});

// Hàm xem bài viết đầy đủ
function readFullPost(postId) {
    const post = blogPosts.find(p => p.id === postId);
    if (post) {
        // Lưu bài viết vào localStorage để hiển thị trên trang chi tiết
        localStorage.setItem('selectedPost', JSON.stringify(post));
        // Chuyển hướng tới trang chi tiết
        window.location.href = 'post-detail.html';
    }
}

// Hàm để lại bình luận
function goToComments(postId) {
    const post = blogPosts.find(p => p.id === postId);
    if (post) {
        alert(`Hệ thống bình luận cho bài: "${post.title}" sẽ được tạo sau.`);
    }
}

// Hàm lưu bài viết
function saveBlogPost(postId, btn) {
    const post = blogPosts.find(p => p.id === postId);
    if (post) {
        // Lấy bài viết đã lưu từ localStorage
        let savedPosts = JSON.parse(localStorage.getItem('savedPosts')) || [];
        
        // Kiểm tra xem bài viết đã được lưu chưa
        const isAlreadySaved = savedPosts.some(p => p.id === postId);
        
        if (isAlreadySaved) {
            // Nếu đã lưu, xóa khỏi danh sách lưu
            savedPosts = savedPosts.filter(p => p.id !== postId);
            btn.classList.remove('saved');
            alert(`Đã xóa bài: "${post.title}" khỏi danh sách lưu`);
        } else {
            // Nếu chưa lưu, thêm vào danh sách lưu
            savedPosts.push(post);
            btn.classList.add('saved');
            alert(`Đã lưu bài: "${post.title}" để dành đọc sau`);
        }
        
        // Lưu vào localStorage
        localStorage.setItem('savedPosts', JSON.stringify(savedPosts));
    }
}

// Hàm like/unlike bài viết
function likeBlogPost(postId, btn) {
    const post = blogPosts.find(p => p.id === postId);
    if (post) {
        // Lấy bài viết đã like từ localStorage
        let likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || [];
        
        // Kiểm tra xem bài viết đã được like chưa
        const isAlreadyLiked = likedPosts.some(p => p.id === postId);
        
        if (isAlreadyLiked) {
            // Nếu đã like, xóa khỏi danh sách like
            likedPosts = likedPosts.filter(p => p.id !== postId);
            btn.classList.remove('liked');
            btn.querySelector('img').src = 'imgs/heart_null.png';
        } else {
            // Nếu chưa like, thêm vào danh sách like
            likedPosts.push(post);
            btn.classList.add('liked');
            btn.querySelector('img').src = 'imgs/heart.png';
        }
        
        // Lưu vào localStorage
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
    }
}

// Hàm thêm bài viết mới (cho admin sau)
function addBlogPost(post) {
    blogPosts.push(post);
    // Lưu vào localStorage
    localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
    // Không reload trang tự động, render lại thay vì
    renderBlogPosts();
}

// Hàm xóa bài viết (cho admin sau)
function deleteBlogPost(postId) {
    const index = blogPosts.findIndex(p => p.id === postId);
    if (index > -1) {
        blogPosts.splice(index, 1);
        localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
        renderBlogPosts();
    }
}

// Hàm render lại bài viết
function renderBlogPosts() {
    const blogContainer = document.getElementById('blogContainer');
    if (blogContainer) {
        blogContainer.innerHTML = '';
        blogPosts.forEach(post => {
            // Render categories
            const categoriesHtml = post.category.map(cat => `<span class="blog-category">#${cat}</span>`).join('');
            
            const blogPostHTML = `
                <article class="blog-post">
                    <div class="blog-content">
                        <h2 class="blog-title" onclick="readFullPost(${post.id})" style="cursor: pointer;">${post.title}</h2>
                        <p class="blog-meta">Published ${post.date} - By ${post.author}</p>
                        <div class="blog-categories">
                            ${categoriesHtml}
                        </div>
                        <p class="blog-description">${post.description}</p>
                        <div class="blog-actions">
                            <a href="#" class="btn-read-more" onclick="readFullPost(${post.id}); return false;">Đọc toàn bộ bài viết</a>
                            <div class="btn-group">
                                <button type="button" class="btn-like" onclick="likeBlogPost(${post.id}, this)" title="Thích bài viết"><img src="imgs/heart_null.png" alt="Like" style="width: 20px; height: 20px;"></button>
                                <button type="button" class="btn-save" onclick="saveBlogPost(${post.id}, this)" title="Lưu bài viết"><img src="imgs/save.png" alt="Save" style="width: 20px; height: 20px;"></button>
                            </div>
                        </div>
                    </div>
                    <div class="blog-image">
                        <img src="${post.image}" alt="${post.title}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                </article>
            `;
            blogContainer.innerHTML += blogPostHTML;
        });
    }
}

// Load blog posts từ localStorage nếu có
function loadBlogPostsFromStorage() {
    const stored = localStorage.getItem('blogPosts');
    if (stored) {
        return JSON.parse(stored);
    }
    return blogPosts;
}

// Hàm lọc bài viết theo thể loại
function filterBlogByCategory(category) {
    const blogContainer = document.getElementById('blogContainer');
    if (!blogContainer) return;
    
    let filteredPosts = blogPosts;
    
    // Nếu category không phải "all", lọc bài viết
    if (category !== 'all') {
        filteredPosts = blogPosts.filter(post => post.category.includes(category));
    }
    
    // Xóa các bài viết cũ
    blogContainer.innerHTML = '';
    
    // Render bài viết đã lọc
    if (filteredPosts.length === 0) {
        blogContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Chưa có bài viết nào trong thể loại này</p>';
        return;
    }
    
    filteredPosts.forEach(post => {
        // Render categories
        const categoriesHtml = post.category.map(cat => `<span class="blog-category">#${cat}</span>`).join('');
        
        const blogPostHTML = `
            <article class="blog-post">
                <div class="blog-content">
                    <h2 class="blog-title" onclick="readFullPost(${post.id})" style="cursor: pointer;">${post.title}</h2>
                    <p class="blog-meta">Published ${post.date} - By ${post.author}</p>
                    <div class="blog-categories">
                        ${categoriesHtml}
                    </div>
                    <p class="blog-description">${post.description}</p>
                    <div class="blog-actions">
                        <a href="#" class="btn-read-more" onclick="readFullPost(${post.id}); return false;">Đọc toàn bộ bài viết</a>
                        <div class="btn-group">
                            <button type="button" class="btn-like" onclick="likeBlogPost(${post.id}, this)" title="Thích bài viết"><img src="imgs/heart_null.png" alt="Like" style="width: 20px; height: 20px;"></button>
                            <button type="button" class="btn-save" onclick="saveBlogPost(${post.id}, this)" title="Lưu bài viết"><img src="imgs/save.png" alt="Save" style="width: 20px; height: 20px;"></button>
                        </div>
                    </div>
                </div>
                <div class="blog-image">
                    <img src="${post.image}" alt="${post.title}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
            </article>
        `;
        blogContainer.innerHTML += blogPostHTML;
    });
}
// Hàm search bài viết
function searchBlog() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();
    const blogContainer = document.getElementById('blogContainer');
    
    if (!blogContainer) return;
    
    // Nếu search box trống, hiển thị tất cả bài viết
    if (searchTerm === '') {
        renderBlogPosts();
        return;
    }
    
    // Filter bài viết theo tiêu đề
    const filteredPosts = blogPosts.filter(post => 
        post.title.toLowerCase().includes(searchTerm)
    );
    
    blogContainer.innerHTML = '';
    
    // Nếu không có kết quả
    if (filteredPosts.length === 0) {
        blogContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Không tìm thấy bài viết nào phù hợp với "<strong>' + searchTerm + '</strong>"</p>';
        return;
    }
    
    // Render bài viết tìm được
    filteredPosts.forEach(post => {
        // Render categories
        const categoriesHtml = post.category.map(cat => `<span class="blog-category">#${cat}</span>`).join('');
        
        const blogPostHTML = `
            <article class="blog-post">
                <div class="blog-content">
                    <h2 class="blog-title" onclick="readFullPost(${post.id})" style="cursor: pointer;">${post.title}</h2>
                    <p class="blog-meta">Published ${post.date} - By ${post.author}</p>
                    <div class="blog-categories">
                        ${categoriesHtml}
                    </div>
                    <p class="blog-description">${post.description}</p>
                    <div class="blog-actions">
                        <a href="#" class="btn-read-more" onclick="readFullPost(${post.id}); return false;">Đọc toàn bộ bài viết</a>
                        <div class="btn-group">
                            <button type="button" class="btn-like" onclick="likeBlogPost(${post.id}, this)" title="Thích bài viết"><img src="imgs/heart_null.png" alt="Like" style="width: 20px; height: 20px;"></button>
                            <button type="button" class="btn-save" onclick="saveBlogPost(${post.id}, this)" title="Lưu bài viết"><img src="imgs/save.png" alt="Save" style="width: 20px; height: 20px;"></button>
                        </div>
                    </div>
                </div>
                <div class="blog-image">
                    <img src="${post.image}" alt="${post.title}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
            </article>
        `;
        blogContainer.innerHTML += blogPostHTML;
    });
}