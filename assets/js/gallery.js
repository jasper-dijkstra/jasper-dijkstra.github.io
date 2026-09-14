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
      ' data-location="' + escapeHtml(photo.location) + '" /></a></article>';
  }

  function setFilter(tag) {
    var filters = document.querySelectorAll('#work-filters button');
    filters.forEach(function (filter) {
      filter.classList.toggle('active', filter.dataset.tag === tag);
    });
  }

  if (filterPage) {
    selectedTag = window.location.hash.slice(1);
    document.querySelectorAll('#work-filters button').forEach(function (filter) {
      filter.addEventListener('click', function () {
        window.location.hash = filter.dataset.tag;
        window.location.reload();
      });
    });
    setFilter(selectedTag);
  }

  gallery.innerHTML = window.PHOTOS.filter(function (photo) {
    return selectedTag === '' || photo.tags.includes(selectedTag);
  }).map(renderPhoto).join('');
}());
