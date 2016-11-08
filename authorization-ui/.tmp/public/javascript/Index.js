$('#myModal').on('show', function() {
	var tit = $('.confirm-delete').data('title');

	$('#myModal .modal-body p').html('האם אתה בטוח שברצונך למחוק את המידור לסרט <b>' + tit + '</b> ?');
	/*var id = $(this).data('id'),
		removeBtn = $(this).find('.danger');*/
});

$('#myAddModal').on('show', function() {
	if (document.getElementById('sources-list').options.length < 2) {}
	/*var id = $(this).data('id'),
		removeBtn = $(this).find('.danger');*/
});

$('#myEditModal').on('show', function() {
	if (document.getElementById('sources-list').options.length < 2) {}
	//var tit = $('.confirm-edit').data('title');

	//$('#myModal .modal-body p').html("האם אתה בטוח שברצונך למחוק את המידור לסרט " + '<b>' + tit +'</b>' + ' ?');
	var id = $(this).data('id');
	var formData = 'id=' + id;
	$.ajax({
		url: '/mission/findone',
		type: 'POST',
		data: formData,
		success: function(midur) {
			//removeBtn = $(this).find('.danger');
			$('#edit-mission').val(midur.missionName);
			$('#edit-source').val(midur.sourceId);
			$('#edit-start').val(midur.startTime.substring(0, 19));
			$('#edit-end').val(midur.endTime.substring(0, 19));
			$('#edit-dest').val(midur.destination);
		},
		error: function() {
			alert('התרחשה שגיאה');
		}
	});
});

$('.confirm-edit').on('click', function(e) {
	e.preventDefault();

	var id = $(this).data('id');
	$('#myEditModal').data('id', id).modal('show');
});

$('#addLabel').on('click', function(e) {
	e.preventDefault();

	//var id = $(this).data('id');
	$('#myAddModal').data('id', 'new').modal('show');
});

$('.confirm-delete').on('click', function(e) {
	e.preventDefault();

	var id = $(this).data('id');
	$('#myModal').data('id', id).modal('show');
});

$('#btnYes').click(function() {
	// handle deletion here
	var id = $('#myModal').data('id');
	var formData = 'id=' + id;
	$.ajax({
		url: '/mission/destroy',
		type: 'POST',
		data: formData,
		success: function(data) {
			if (data === '') {
				$('[data-id=' + id + ']').parents('tr').remove();
				$('#myModal').modal('hide');
			} else {
				alert('התרחשה שגיאה בעת המחיקה');
			}
		},
		error: function() {
			alert('התרחשה שגיאה בעת המחיקה');
		}
	});
});

$('#btnYesEdit').click(function() {
	// handle deletion here
	var id = $('#myEditModal').data('id');
	var formData = 'id=' + id +
		'&missionName=' + $('#edit-mission').val() +
		'&sourceId=' + $('#edit-source').val() +
		'&start_time=' + $('#edit-start').val() +
		'&end_time=' + $('#edit-end').val() +
		'&destination=' + $('#edit-dest').val();
	$.ajax({
		url: '/mission/update',
		type: 'POST',
		data: formData,
		success: function(data) {
			console.log('work');
			if (data === '') {
				//$('#myModal').modal('hide');
				window.location.reload(true);
			} else {
				$('#myModal').modal('hide');
				alert('התרחשה שגיאה בעת העדכון');
			}
		},
		error: function() {
			$('#myModal').modal('hide');
			alert('התרחשה שגיאה בעת העדכון');
		}
	});
});

$('#btnYesAdd').click(function() {
	// handle deletion here
	//var id = $('#myEditModal').data('id');
	var formData =
		'missionName=' + $('#add-mission').val() +
		'&sourceId=' + $('#add-source').val() +
		'&start_time=' + $('#add-start').val() +
		'&end_time=' + $('#add-end').val() +
		'&destination=' + $('#add-dest').val();
	$.ajax({
		url: '/mission/create',
		type: 'POST',
		data: formData,
		async: false,
		success: function(data) {
			console.log('work');
			if (data === '') {
				window.location.reload(true);
			} else {
				$('#myModal').modal('hide');
				alert('התרחשה שגיה בעת יצירת מידור חדש');
			}
		},
		error: function() {
			$('#myModal').modal('hide');
			alert('התרחשה שגיה בעת יצירת מידור חדש');
		}
	});
});
