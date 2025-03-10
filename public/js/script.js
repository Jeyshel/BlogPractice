function toggleEditMode(editFormId, displayElementsIds, editButtonId) {
    const editForm = document.getElementById(editFormId);
    const editButton = document.getElementById(editButtonId);
    const displayElements = displayElementsIds.map(id => document.getElementById(id));

    if (editForm.style.display === 'none') {
        editForm.style.display = 'block';
        displayElements.forEach(element => element.style.display = 'none');
        editButton.style.display = 'none';
    } else {
        editForm.style.display = 'none';
        displayElements.forEach(element => element.style.display = 'block');
        editButton.style.display = 'inline-block';
    }
}

// JQUERY/AJAX FUNCTIONS
$(document).ready(function(){
    // make function modular for both votes
    function upvotePost(postId){
        console.log('Upvoting post:', postId);
        $.ajax({
            url: `/post/upvote/${postId}`,
            method: 'POST',
            success: function(result) {
                if (result.success) {
                    const upvotes = $(this).find('.upvote-count');
                    if (upvotes.length) {
                        upvotes.text(result.upvotes);
                        console.log('Upvote count updated:', result.upvotes);
                    } else {
                        console.error('Upvote count element not found');
                    }
                }
            },
            error: function(xhr, status, error) {
                console.error('Failed to upvote post:', error);
            }
        });
    }

    // Event Listeners
    $('.upvote-btn').click(function(){
        const postId = $(this).attr('postId');
        console.log('Button clicked, postId:', postId);
        upvotePost(postId);
    });
});
