import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { dataRequest, allPages } from './js/api-request';

const form = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const guard = document.querySelector('.js-guard');
// console.log(typeof guard);

const lightbox = new SimpleLightbox('.gallery a');

form.addEventListener('input', onInput);

let searchQuery = '';
let page = 1;

const options = {
  root: null,
  rootMargin: '700px',
  threshold: 0,
};

const observer = new IntersectionObserver(onObserver, options);

//значення інпуту є змістом запиту
function onInput(evt) {
  searchQuery = evt.target.value.trim();
  //   console.log(searchQuery);
  return searchQuery;
}

form.addEventListener('submit', onSubmit);

//при заповненому інпуті виконуємо сабміт та викликаємо функцію щоб виконати запит та отримати результати
function onSubmit(evt) {
  evt.preventDefault();
  gallery.innerHTML = '';
  page = 1;
  observer.unobserve(guard);
  if (!evt.target.elements.searchQuery.value.trim()) {
    Notiflix.Notify.failure(
      'Input is empty. Please, write the subject of your request.'
    );
  } else {
    resultOfRequest();
  }
}

//здійснення запиту, виклик функціі для отримання результатів запиту
async function resultOfRequest() {
  try {
    const response = await dataRequest(searchQuery, page);
    reciveOfImages(response);
  } catch (error) {
    console.log(error);
  }
}

//масив об"єктів та виклик функці для створення розмітки
function reciveOfImages(response) {
  const images = response.data.hits;
  console.log(images);

  if (!images.length) {
    gallery.innerHTML = '';
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } else {
    createGalleryMarkup(images);
    if (allPages > 1) {
      observer.observe(guard);
    }
    lightbox.refresh();

    if (page === allPages) {
      observer.unobserve(guard);
    }

    if (page === 1) {
      Notiflix.Notify.success(
        `Hooray! We found ${response.data.totalHits} images.`
      );
    }

    if (page > allPages) {
      Notiflix.Notify.warning(
        `"We're sorry, but you've reached the end of search results."`
      );
    }
  }
}

//створення розмітки
function createGalleryMarkup(images) {
  const markup = images
    .map(image => {
      const {
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      } = image;
      return `<a class="gallery-item" href="${largeImageURL}">
      <div class="photo-card">
        <img class="gallery-image" src="${webformatURL}" alt="${tags}" loading="lazy" />
    </div>
      <div class="info">
        <p class="info-item"><b>Likes</b> <br>${likes}</p>
        <p class="info-item"><b>Views</b> <br>${views}</p>
        <p class="info-item"><b>Comments</b> <br>${comments}</p>
        <p class="info-item"><b>Downloads</b> <br>${downloads}</p>
      </div></a>`;
    })
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
}

//нескінченний скролл
async function onObserver(entries, observer) {
  console.log(entries);
  entries.forEach(entry => {
    if (page < allPages && entry.isIntersecting) {
      page += 1;
      resultOfRequest();
    }
  });
}
