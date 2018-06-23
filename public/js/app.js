
$(document).on('click', '#getArticles', function(event) {
    event.preventDefault;

    $('#listedArticles').empty();
    $.ajax({
        method: 'GET',
        url: '/scrape'
    }).then(function(dbArticles) {
        console.log("scraped");
        $.getJSON('/api/articles', function(data) {
            data.forEach(function(article) {
                $('#listedArticles').append(
                    `<div class="card mb-3">
                        <div class="card-body">
                            <a href="${article.link}" target="_blank">${article.title}</a>
                            <p>${article.summary}</p>
                            <button value="${article._id}" type="button" class="btn btn-warning deleteArticle">Delete</button>
                            <a href="/articles/${article._id}">
                                <button type="button" class="btn btn-primary">Add Notes</button>
                            </a>
                        </div>
                    </div>`
                );
            });
            console.log("Added to DOM")
        });
    }).catch(function(err) {
        if (err) console.log(err);
    });
});

$(document).on('click', '#eraseArticles', function(event) {
    event.preventDefault;
    $('#listedArticles').empty();
});

$(document).on('click', '.submit', function(event) {
    event.preventDefault;
    const articleId = $(this).val();
    const title = $('#noteTitle').val();
    const body = $('#noteBody').val();
    $.ajax({
        method: 'POST',
        url: `/notes/${articleId}`,
        data: {
            title: title,
            body: body
        },
        success: function(data) {
            console.log(data);
            $('#listedNotes').append(`
                <div class="card mb-3">
                    <div class="card-header">
                        <h4>${title}</h4>
                    </div>
                    <div class="card-body">
                        <p>""${body}"</p>
                        <button value="${data.notes[data.notes.length - 1]}" type="button" class="btn btn-warning deleteNote">Delete</button>
                    </div>
                </div>`
            );
        },
        error: function(err) {
            console.log(err);
        }
    })
});

$(document).on('click', '.deleteArticle', function(event) {
    event.preventDefault;
    const articleId = $(this).val();
    const card = $(this.parentElement.parentElement);
    $.ajax({
        method: 'DELETE',
        url: `/delete/articles/${articleId}`,
        success: function(data) {
            console.log(data);
            card.remove();
        },
        error: function(err) {
            console.log(err);
        }
    });
});

$(document).on('click', '.deleteNote', function(event) {
    event.preventDefault;
    const noteId = $(this).val();
    const articleId = $('.submit').val();
    const card = $(this.parentElement.parentElement);
    $.ajax({
        method: 'DELETE',
        url: `/delete/notes/${articleId}/${noteId}`,
        success: function(data) {
            console.log(data);
            console.log('deleted');
            card.remove();
        },
        error: function(err) {
            console.log(err);
        }
    });
});
