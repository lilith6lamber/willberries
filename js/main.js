const mySwiper = new Swiper('.swiper-container', {
	loop: true,

	// Navigation arrows
	navigation: {
		nextEl: '.slider-button-next',
		prevEl: '.slider-button-prev',
	},
});

// cart

const buttonCart = document.querySelector('.button-cart');
const modalCart = document.querySelector('#modal-cart');
//const modalClose = document.querySelector('.modal-close');

const openModal = () => {
	modalCart.classList.add('show')
};
const closeModal = () => {
	modalCart.classList.remove('show')
};

buttonCart.addEventListener('click', openModal);
modalCart.addEventListener('click', e => {
	if (e.target.classList.contains('show') || e.target.classList.contains('modal-close')) {
		closeModal()
	}
});


// smooth scroll

(function() {
	const scrollLinks = document.querySelectorAll('a.scroll-link');
	
	for (const scrollLink of scrollLinks) {
		scrollLink.addEventListener('click', e => {
			e.preventDefault();
			const id = scrollLink.getAttribute('href');
			document.querySelector(id).scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			});
		});
	}
})()

// products

const btnMore = document.querySelector('.more');
const navItem = document.querySelectorAll('.navigation-link');
const productsList = document.querySelector('.long-goods-list');


const getProducts = async () => {
	const result = await fetch('db/db.json');
	if (!result.ok) {
		throw 'Ошибочка вышла:' + result.status;
	}
	return await result.json();
}

const createCard = ({ label, name, img, description, id, price }) => {
	const card = document.createElement('div');
	card.className = 'col-lg-3 col-sm-6';


	card.innerHTML = `
		<div class="goods-card">
			${label ? `<span class="label">${label}</span>` : ''}
			<img src="db/${img}" alt="${name}" class="goods-image">
			<h3 class="goods-title">${name}</h3>
			<p class="goods-description">${description}</p>
			<button class="button goods-card-btn add-to-cart" data-id="${id}">
				<span class="button-price">$${price}</span>
			</button>
		</div>
	`;
	return card;
};

const renderCards = data => {
	productsList.textContent = '';
	const cards = data.map(createCard);
	productsList.append(...cards);
	document.body.classList.add('show-goods');
};

btnMore.addEventListener('click', e => {
	e.preventDefault();
	getProducts().then(renderCards);
});

// filter

const filterCards = (field, value) => {
	getProducts().then(data => {
		const result = data.filter(item => {
			return item[field] === value;
		});
		return result;
	})
		.then(renderCards);
}

navItem.forEach(link => {
	link.addEventListener('click', e => {
		e.preventDefault();
		const field = link.dataset.field;
		const value = link.textContent;
		if (value != 'All') {
			filterCards(field, value);
		} else {
			getProducts().then(renderCards);
		}
	});
});

// 
const btnViewProducts = document.querySelectorAll('button.view-products');
btnViewProducts.forEach(btn => {
	const category = btn.dataset.category;
	btn.addEventListener('click', e => {
		e.preventDefault();
		filterCards('category', category);
		document.body.scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		});
	});
});