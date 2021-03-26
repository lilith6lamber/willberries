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
	cart.renderCart();
	modalCart.classList.add('show');
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

(function () {
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

const createCard = ({
	label,
	name,
	img,
	description,
	id,
	price
}) => {
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

// cart table

const cartTableGoods = document.querySelector('.cart-table__goods');
const cartTableTotal = document.querySelector('.cart-table__total');

const cart = {
	cartProducts: [],
	renderCart() {
		cartTableGoods.textContent = '';
		this.cartProducts.forEach(({
			id,
			name,
			price,
			count
		}) => {
			const trItem = document.createElement('tr');
			trItem.className = 'cart-item';
			trItem.dataset.id = id;

			trItem.innerHTML = `
				<td>${name}</td>
				<td>${price} $</td>
				<td>
					<button class="cart-btn-minus"> - </button>
				</td>
				<td> ${count} </td>
				<td>
					<button class="cart-btn-plus"> + </button>
				</td>
				<td> ${price * count} $ </td>
				<td>
					<button class="cart-btn-delete"> x </button></td>
			`;
			cartTableGoods.append(trItem);
		});

		const totalPrice = this.cartProducts.reduce((sum, item) => {
			return sum + item.price * item.count;
		}, 0);
		cartTableTotal.textContent = totalPrice + '$';
	},
	deleteProduct(id) {
		this.cartProducts = this.cartProducts.filter(item => id !== item.id);
		this.renderCart();
	},
	minusProduct(id) {
		for (const item of this.cartProducts) {
			if (item.id === id) {
				if (item.count === 1) {
					this.deleteProduct(id);
				} else {

					item.count--;
				}
				break
			}
		}
		this.renderCart();
	},
	plusProduct(id) {
		for (const item of this.cartProducts) {
			if (item.id === id) {
				item.count++;
				break
			}
		}
		this.renderCart();
	},
	addCartProducts(id) {
		const productItem = this.cartProducts.find(item => item.id === id);
		if (productItem) {
			this.plusProduct(id);
		} else {
			getProducts()
				.then(data => data.find(item => item.id === id))
				.then(({ id, name, price }) => {
					this.cartProducts.push({
						id,
						name,
						price,
						count: 1
					});
				});
		}
	},
	cleanCart() {
		this.cartProducts.length = 0;
	}
}

document.body.addEventListener('click', e => {
	const addToCart = e.target.closest('.add-to-cart');
	if (addToCart) {
		cart.addCartProducts(addToCart.dataset.id);
	}

});

cartTableGoods.addEventListener('click', e => {
	const target = e.target;

	if (target.tagName === 'BUTTON') {
		const id = target.closest('.cart-item').dataset.id;
		if (target.classList.contains('cart-btn-delete')) {
			cart.deleteProduct(id);
		}
		if (target.classList.contains('cart-btn-minus')) {
			cart.minusProduct(id);
		}
		if (target.classList.contains('cart-btn-plus')) {
			cart.plusProduct(id);
		}
	}
});


// form
const modalForm = document.querySelector('.modal-form');

// server
const postData = dataUser => fetch('server.php', {
	method: 'POST',
	body: dataUser
});

modalForm.addEventListener('submit', e => {
	e.preventDefault();
	const formData = new FormData(modalForm);
	formData.append('order', JSON.stringify(cart.cartProducts));
	postData(formData)
		.then(response => {
			if (!response.ok) {
				throw new Error(response.status);
			}
			alert('Ваш заказ успешно отправлен. С вами свяжутся в ближайшее время.');
		})
		.catch(err => {
			alert('Произошла ошибка. Повторите попытку позже.');
		})
		.finally(() => {
			closeModal();
			modalForm.reset();
			cart.cleanCart();
		})
});