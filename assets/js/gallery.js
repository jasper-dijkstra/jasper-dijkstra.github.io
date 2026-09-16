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

  function createPhotoItem(photo, index) {
    var item = document.createElement('article');
    var markup = renderPhoto(photo, index);
    item.className = 'thumb' + (index >= batchSize ? ' gallery-item-hidden' : '');
    item.innerHTML = markup.slice(markup.indexOf('>') + 1, markup.lastIndexOf('</article>'));
    return item;
  }

  var workMenu = document.querySelector('.work-menu');
  var workMenuTrigger = workMenu && workMenu.querySelector('.work-menu-trigger');
  if (workMenu && workMenuTrigger) {
    workMenuTrigger.addEventListener('click', function (event) {
      if (window.matchMedia('(max-width: 700px)').matches && !workMenu.classList.contains('is-open')) {
        event.preventDefault();
        workMenu.classList.add('is-open');
      }
    });
    document.addEventListener('click', function (event) {
      if (!workMenu.contains(event.target)) workMenu.classList.remove('is-open');
    });
  }

  if (filterPage) {
    selectedTag = new URLSearchParams(window.location.search).get('category') || '';
    document.querySelector('#work-heading h2').textContent = selectedTag ? selectedTag.charAt(0).toUpperCase() + selectedTag.slice(1) : 'Werk';
  }

  var landscapeFilter = filterPage && (selectedTag === 'landschap' || selectedTag === 'landscape');

  var filteredPhotos = window.PHOTOS.filter(function (photo) {
    if (selectedTag === '') return true;
    if (landscapeFilter) return photo.tags.includes('landschap') || photo.tags.includes('landscape');
    return photo.tags.includes(selectedTag);
  });

  gallery.innerHTML = filteredPhotos.map(renderPhoto).join('');

  var getColumnCount = function () {
    if (window.matchMedia('(max-width: 700px)').matches) return 2;
    return Math.max(1, Math.floor(gallery.clientWidth / 300));
  };
  var columns = [];
  var columnCount = getColumnCount();
  var columnMarkup = '';

  gallery.style.setProperty('--gallery-columns', columnCount);
  gallery.style.setProperty('--gallery-rest-columns', Math.max(1, columnCount - 1));

  for (var columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
    columnMarkup += '<div class="gallery-column"></div>';
  }
  gallery.innerHTML = columnMarkup;
  columns = Array.prototype.slice.call(gallery.querySelectorAll('.gallery-column'));

  var items = filteredPhotos.map(function (photo, index) {
    return createPhotoItem(photo, index);
  });

  items.forEach(function (item, index) {
    columns[index % columns.length].appendChild(item);
  });

  var relayout = function () {
    columns.forEach(function (column) {
      while (column.firstChild) column.removeChild(column.firstChild);
    });

    var visibleItems = items.filter(function (item) {
      return !item.classList.contains('gallery-item-hidden');
    });

    visibleItems.forEach(function (item) {
      var shortestColumn = columns.reduce(function (shortest, column) {
        return column.offsetHeight < shortest.offsetHeight ? column : shortest;
      }, columns[0]);
      shortestColumn.appendChild(item);
    });

    items.filter(function (item) {
      return item.classList.contains('gallery-item-hidden');
    }).forEach(function (item, index) {
      columns[index % columns.length].appendChild(item);
    });
  };

  var relayoutPending = false;
  items.forEach(function (item) {
    var image = item.querySelector('img');
    image.addEventListener('load', function () {
      if (relayoutPending) return;
      relayoutPending = true;
      window.requestAnimationFrame(function () {
        relayoutPending = false;
        relayout();
      });
    });
  });

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
    button.addEventListener('click', function (event) {
      event.preventDefault();
      var scrollTop = window.pageYOffset;

      Array.prototype.slice.call(hiddenItems(), 0, batchSize).forEach(function (item) {
        item.classList.remove('gallery-item-hidden');
      });

      relayout();

      window.requestAnimationFrame(function () {
        window.scrollTo(0, scrollTop);
      });

      if (hiddenItems().length === 0) {
        controls.remove();
      }
    });
    controls.appendChild(button);
    gallery.parentNode.insertBefore(controls, gallery.nextSibling);
  }
}());
