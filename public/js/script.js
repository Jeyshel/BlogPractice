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

/* 
$(document).ready(function(){
    // make modular for both vote options
    function upvotePost(postId, button){
        console.log('Upvoting post:', postId);
        $.ajax({
            url: `/post/upvote/${postId}`,
            method: 'POST',
            success: function(result) {
                if (result.success) {
                    const upvoteCount = $(button).find('.upvote-count');
                    if (upvoteCount.length) {
                        upvoteCount.text(result.upvotes);
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

    // Attach event listener to upvote buttons
    $('.upvote-btn').click(function(){
        const postId = $(this).attr('postId');
        console.log('Button clicked, postId:', postId);
        upvotePost(postId, this);
    });
});
*/

$(document).ready(function(){

    function upvote(postId, button){
        $.ajax({
            url: `/post/upvote/${postId}`,
            method: 'POST',
            success: function(res){
                if(res.success) {
                    const upvoteCount = $(button).find('.upvote-count');
                    const downvoteCount = $(button).siblings('.downvote-btn').find('.downvote-count');
                    upvoteCount.text(res.upvotes);
                    downvoteCount.text(res.downvotes);
                }
            }
        })
    }


    // TWEAK LISTENERS, active state disappears when switching between upvote and downvote
    //Listener
    $('.upvote-btn').click(function(){
        const postId = $(this).attr('postId');
        console.log('Upvote, postId:', postId);

        upvote(postId, this);

         // Toggle the active class on the upvote button
         $(this).toggleClass('vote-active');
         // Remove the active class from the sibling downvote button
         $(this).siblings('.downvote-btn').removeClass('vote-active');
 
    });

    function downvote(postId, button){
        $.ajax({
            url: `/post/downvote/${postId}`,
            method: 'POST',
            success: function(res){
                if(res.success) {
                    const downvoteCount = $(button).find('.downvote-count');
                    const upvoteCount = $(button).siblings('.upvote-btn').find('.upvote-count');
                    downvoteCount.text(res.downvotes);
                    upvoteCount.text(res.upvotes);
                }
            }
        })
    }

    // Listeners
    $('.downvote-btn').click(function(){
        const postId = $(this).attr('postId');
        console.log('Downvote, postId:', postId);

        downvote(postId, this);
        // Toggle the active class on the upvote button
        $(this).toggleClass('vote-active');
        // Remove the active class from the sibling downvote button
        $(this).siblings('.upvote-btn').removeClass('vote-active');
    });

});
