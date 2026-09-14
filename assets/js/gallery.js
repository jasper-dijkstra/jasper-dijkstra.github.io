(function () {
  var gallery = document.querySelector('#main');
  var selectedTag = gallery.dataset.tag || '';
  var filterPage = gallery.dataset.filterPage === 'true';

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[character];
    });
  }

  function renderPhoto(photo) {
    var name = photo.photo.split('/').pop();
    return '<article class="thumb">' +
      '<a href="' + escapeHtml(photo.photo) + '" class="image">' +
      '<img src="' + escapeHtml(photo.thumbnail) + '" alt="' + escapeHtml(photo.description || 'Photograph by Jasper Dijkstra') + '"' +
      ' data-name="' + escapeHtml(name) + '"' +
      ' data-description="' + escapeHtml(photo.description) + '"' +
      ' data-location="' + escapeHtml(photo.location) + '"' +
      ' data-camera="' + escapeHtml(photo.camera) + '"' +
      ' data-objective="' + escapeHtml(photo.objective) + '"' +
      ' data-aperture="' + escapeHtml(photo.aperture) + '"' +
      ' data-shutter-speed="' + escapeHtml(photo.shutter_speed) + '"' +
      ' data-iso="' + escapeHtml(photo.iso) + '" /></a></article>';
  }

  if (filterPage) {
    selectedTag = new URLSearchParams(window.location.search).get('category') || '';
    document.querySelector('#work-heading h2').textContent = selectedTag ? selectedTag.charAt(0).toUpperCase() + selectedTag.slice(1) : 'Werk';
  }

  gallery.innerHTML = window.PHOTOS.filter(function (photo) {
    return selectedTag === '' || photo.tags.includes(selectedTag);
  }).map(renderPhoto).join('');
}());
