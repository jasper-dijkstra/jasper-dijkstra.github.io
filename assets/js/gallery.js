(function () {
  var gallery = document.querySelector('#main');
  var selectedTag = gallery.dataset.tag || '';
  var filterPage = gallery.dataset.filterPage === 'true';
  var batchSize = 25;

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

  function renderPhoto(photo, index) {
    var name = photo.photo.split('/').pop();
    var hidden = index >= batchSize ? ' gallery-item-hidden' : '';
    return '<article class="thumb' + hidden + '">' +
      '<a href="' + escapeHtml(photo.photo) + '" class="image">' +
      '<img loading="lazy" src="' + escapeHtml(photo.thumbnail) + '" alt="' + escapeHtml(photo.description || 'Photograph by Jasper Dijkstra') + '"' +
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

  var filteredPhotos = window.PHOTOS.filter(function (photo) {
    return selectedTag === '' || photo.tags.includes(selectedTag);
  });

  gallery.innerHTML = filteredPhotos.map(renderPhoto).join('');

  if (filteredPhotos.length > batchSize) {
    var controls = document.createElement('div');
    var button = document.createElement('button');
    var hiddenItems = function () {
      return gallery.querySelectorAll('.gallery-item-hidden');
    };

    controls.className = 'gallery-controls';
    button.className = 'load-more';
    button.type = 'button';
    button.textContent = 'Laad meer foto\'s';
    button.addEventListener('click', function () {
      Array.prototype.slice.call(hiddenItems(), 0, batchSize).forEach(function (item) {
        item.classList.remove('gallery-item-hidden');
      });

      if (hiddenItems().length === 0) {
        controls.remove();
      }
    });
    controls.appendChild(button);
    gallery.parentNode.insertBefore(controls, gallery.nextSibling);
  }
}());
