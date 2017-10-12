'use strict';
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var app = {
	// Application Constructor
	initialize: function initialize() {
		document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
		//this.vueInit();
	},

	// deviceready Event Handler
	//
	// Bind any cordova events here. Common events are:
	// 'pause', 'resume', etc.
	onDeviceReady: function onDeviceReady() {
		this.receivedEvent('deviceready');
	},

	// Update DOM on a Received Event
	receivedEvent: function receivedEvent(id) {
		
		// Push notification initialize
		if(localStorage.isPushNotification && localStorage.isPushNotification == 'push'){
			// Enable to debug issues.
			// window.plugins.OneSignal.setLogLevel({logLevel: 4, visualLevel: 4});

			var notificationOpenedCallback = function notificationOpenedCallback(jsonData) {
				console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
			};

			window.plugins.OneSignal.startInit("d8e57713-9364-4af7-a2dd-306e62d88e1d").handleNotificationOpened(notificationOpenedCallback).endInit();
		}
		
		// Vue initialize
		this.vueInit();
	},
	// Vue initialize
	vueInit: function vueInit() {

		// Top Buttons component 
		var top = Vue.component('top', {
			template: '#top-template',
			props: ['logoutUser', 'fetchOrders', 'page', 'refreshLoading']
		});

		// Logo component 
		var logo = Vue.component('logo', {
			template: '#logo-template'
		});

		// Orders component 
		var order = Vue.component('order', {
			template: '#order-template',
			props: ['order', 'index', 'content-type', 'cancelled-data']
		});
		
		// Setting component 
		var Setting = Vue.component('setting', {
			template: '#setting-template',
			components: {logo: logo, top: top},
			data: function data() {
				return {
					headerTitle: 'Setting Ecolino',
					isPushNotification: true
				}
			},
			methods: {
				// delete all push notification
				deletePushNotification: function deletePushNotification() {
					navigator.notification.confirm('Хотите удалить все уведомления?', function (buttonIndex) {
						if(buttonIndex == 1){
							window.plugins.OneSignal.clearOneSignalNotifications();
						}
					}, 'Ecolino', ['Да', 'Нет']);
				},
				// clear memory
				clearMemory: function clearMemory() {
					navigator.notification.confirm('Хотите очистить память?', function (buttonIndex) {
						if(buttonIndex == 1){
							localStorage.clear();
						}
					}, 'Ecolino', ['Да', 'Нет']);
				}
			},
			watch: {
				// эта функция запускается при любом изменении вопроса
				isPushNotification: function () {
					if(this.isPushNotification) {
						localStorage.isPushNotification = 'push';
						// Push notification on
						window.plugins.OneSignal.setSubscription(true);
					} else {
						localStorage.isPushNotification = 'nopush';
						// Push notification off
						window.plugins.OneSignal.setSubscription(false);
					}
				}
			},
			created: function created() {
				if (localStorage.isPushNotification && localStorage.isPushNotification == 'push') {
					this.isPushNotification = true;
				} else {
					this.isPushNotification = false;
				}
			}
		});

		// Login component 
		var Login = Vue.component('login', {
			components: { logo: logo },
			template: '#login-template',
			data: function data() {
				return {
					title: 'авторизация',
					loginLoader: false,
					username: '',
					password: '',
					endpoint: this.$root.endpointLogin
				};
			},
			methods: {
				loginUser: function loginUser() {
					var _this = this;

					if (!this.username || !this.password) {

						navigator.notification.alert('Введите логин и пароль!', function () {}, 'Авторизация', 'OK');
					} else {

						// show loader
						this.loginLoader = true;
		
						axios.get(this.endpoint + '?username=' + this.username + '&password=' + this.password).then(function (data) {
							if (data.data.status) {
								
								// show loader
								_this.loginLoader = false;
								
								localStorage.user = data.data.id_user;

								navigator.notification.alert(data.data.message, function () {}, 'Авторизация', 'OK');
								_this.$router.push('/');
							} else {

								navigator.notification.alert(data.data.message, function () {}, 'Авторизация', 'OK');
							}
						}).catch(function (err) {
							return navigator.notification.alert('Ошибка соединения с сервером!', function () {}, 'Авторизация', 'OK');
						});
					}
				}
			}
		});

		// Home component 
		var Home = Vue.component('home', {
			components: { order: order, logo: logo, top: top },
			template: '#home-template',
			data: function data() {
				return {
					isNew: true,
					isMy: false,
					refreshLoading: false,
					headerTitle: this.$root.headerTitle + 'Home',
					endpoint: this.$root.endpointOrder,
					cancelledData: {},
					orderAllLists: {},
					userId: 0
				};
			},
			computed: {
				newOrders: function newOrders() {
					localStorage.setItem('currentDataNew', JSON.stringify(this.orderAllLists.orders_new));
					return this.orderAllLists.orders_new;
				},
				myOrders: function myOrders() {
					localStorage.setItem('currentDataMy', JSON.stringify(this.orderAllLists.orders_my));
					return this.orderAllLists.orders_my;
				}
			},
			methods: {
				fetchOrders: function fetchOrders() {
					
					var _this555 = this;
					
					this.refreshLoading = true;
					
					axios.get(this.endpoint + '?id_user=' + this.userId).then(function (data) {
						
						_this555.refreshLoading = false;
						
						if (data.data) {
							_this555.orderAllLists = data.data;
						}
					}).catch(function (err) {
						return navigator.notification.alert('Ощибка соединения с сервером!', function () {}, 'Ecolino', 'OK');
					});
				},
				logoutUser: function logoutUser() {

					if (localStorage.user) {
						
						var _this222 = this;
						
						navigator.notification.confirm('Вы уверены, что хотите выйти из аккаунта?', function (buttonIndex) {
							if(buttonIndex == 1){
								localStorage.removeItem("user");

								//загружаем компонент login
								_this222.$router.push('/login');
							}
						}, 'Ecolino', ['Да', 'Нет']);
						
					} else {
						navigator.notification.alert('Вы не были ранее авторизованы!', function () {}, 'Ecolino', 'OK');
					}
				}
			},
			watch: {
				'$route': function $route(to, from) {
					this.fetchOrders();
				}
			},
			created: function created() {
				if (localStorage.user) {
					this.userId = localStorage.user;
					
					this.fetchOrders();
					
					if(localStorage.cancelled){
						this.cancelledData = JSON.parse(localStorage.getItem('cancelled'));
					}
					
				} else {
					this.$router.push('/login');
				}
			}
		});

		// View component 
		var View = Vue.component('view', {
			components: { logo: logo, top: top },
			template: '#view-template',
			data: function data() {
				return {
					headerTitle: 'View Ecolino',
					conflictLoader: false,
					failLoader: false,
					doneLoader: false,
					preFailLoader: false,
					acceptLoader: false,
					userId: 0,
					endpoint: this.$root.endpointAction,
					pageData: false
				};
			},
			computed: {
				getPage: function getPage() {
					if (this.$route.params.contentType == 'new' && localStorage.currentDataNew) {
						
						var currentDataNew = JSON.parse(localStorage.getItem('currentDataNew'));
						
						if(currentDataNew){
							this.pageData = currentDataNew[this.$route.params.id];
						}

					} else if (this.$route.params.contentType == 'my' && this.$store.getters.getAllOrders.orders_my[this.$route.params.id]) {

						var currentDataMy = JSON.parse(localStorage.getItem('currentDataMy'));
						
						if(currentDataMy){
							this.pageData = currentDataMy[this.$route.params.id];
						}
					}
				}
			},
			watch: {
				'$route': function $route(to, from) {
					this.getPage();
				}
			},
			methods: {
				acceptOrder: function acceptOrder() {
					var _this2 = this;
					
					navigator.notification.confirm('Вы хотите взять этот заказ?', function (buttonIndex) {
						if(buttonIndex == 1){
							// show loader
							_this2.acceptLoader = true;

							axios.get(_this2.endpoint + '?id_user=' + _this2.userId + '&id_type=1&id_order=' + _this2.pageData.id).then(function (data) {

								navigator.notification.alert(data.data.message, function () {}, 'Ecolino', 'OK');
								_this2.$router.push('/');
								
								// show loader
								_this2.acceptLoader = false;
							
							}).catch(function (err) {
								return navigator.notification.alert('Ощибка соединения с сервером!', function () {}, 'Ecolino', 'OK');
							});
						}
					}, 'Ecolino', ['Да', 'Нет']);
				},
				preFailOrder: function preFailOrder() {
					
					var _this21 = this;
					
					navigator.notification.confirm('Вы точно хотите убрать этот заказ из списка доступных?', function (buttonIndex) {
						if(buttonIndex == 1){
							
							var cancelled = [];
							// show loader
							//_this21.preFailLoader = true;
							if(localStorage.cancelled){
								
								cancelled = JSON.parse(localStorage.getItem('cancelled'));
								cancelled[_this21.$route.params.id] = _this21.$route.params.id;
								localStorage.setItem('cancelled', JSON.stringify(cancelled));
								
							} else {

								cancelled[_this21.$route.params.id] = _this21.$route.params.id;
								localStorage.setItem('cancelled', JSON.stringify(cancelled));
							}
							
							_this21.$router.push('/');
							
							// hide loader
							//_this21.preFailLoader = false;
					
						}
					}, 'Ecolino', ['Да', 'Нет']);
				},
				failOrder: function failOrder() {
					var _this3 = this;
					
					navigator.notification.confirm('Вы хотите отказаться от заказа?', function (buttonIndex) {
						if(buttonIndex == 1){
					
							// show loader
							_this3.failLoader = true;

							axios.get(_this3.endpoint + '?id_user=' + _this3.userId + '&id_type=3&id_order=' + _this3.pageData.id).then(function (data) {

								navigator.notification.alert(data.data.message, function () {}, 'Ecolino', 'OK');
								_this3.$router.push('/');
								
								// show loader
								_this3.failLoader = false;
							
							}).catch(function (err) {
								return navigator.notification.alert('Ощибка соединения с сервером!', function () {}, 'Ecolino', 'OK');
							});
						}
					}, 'Ecolino', ['Да', 'Нет']);
				},
				doneOrder: function doneOrder() {
					var _this4 = this;
					navigator.notification.confirm('Вы действительно выполнили этот заказ?', function (buttonIndex) {
						if(buttonIndex == 1){
							// show loader
							_this4.doneLoader = true;

							axios.get(_this4.endpoint + '?id_user=' + _this4.userId + '&id_type=2&id_order=' + _this4.pageData.id).then(function (data) {

								navigator.notification.alert(data.data.message, function () {}, 'Ecolino', 'OK');
								_this4.$router.push('/');
								
								// show loader
								_this4.doneLoader = false;
							
							}).catch(function (err) {
								return navigator.notification.alert('Ощибка соединения с сервером!', function () {}, 'Ecolino', 'OK');
							});
						}
					}, 'Ecolino', ['Да', 'Нет']);
				},
				conflictOrder: function conflictOrder() {
					var _this5 = this;
					navigator.notification.confirm('Вы уверены в своих действиях?', function (buttonIndex) {
						if(buttonIndex == 1){
							// show loader
							_this5.conflictLoader = true;

							axios.get(_this5.endpoint + '?id_user=' + _this5.userId + '&id_type=4&id_order=' + _this5.pageData.id).then(function (data) {

								navigator.notification.alert(data.data.message, function () {}, 'Ecolino', 'OK');
								_this5.$router.push('/');
								
								// show loader
								_this5.conflictLoader = false;
							
							}).catch(function (err) {
								return navigator.notification.alert('Ощибка соединения с сервером!', function () {}, 'Ecolino', 'OK');
							});
						}
					}, 'Ecolino', ['Да', 'Нет']);
				}
			},
			created: function created() {
				this.userId = localStorage.user;
				this.getPage();
			}
		});

		// Router
		var router = new VueRouter({
			routes: [{
				path: '/',
				name: 'home',
				component: Home,
				props: true
			}, {
				path: '/setting',
				name: 'setting',
				component: Setting,
				props: true
			}, {
				path: '/login',
				name: 'login',
				component: Login,
				props: true
			}, {
				path: '/view/:contentType/:id',
				name: 'view',
				component: View,
				props: true
			}]
		});

		var vm = new Vue({
			data: {
				headerTitle: 'Ecolino',
				endpointLogin: 'https://ecolino.ru/api/auth',
				endpointOrder: 'https://ecolino.ru/api/orders',
				endpointAction: 'https://ecolino.ru/api/order',
				userId: 0
			},
			router: router
		}).$mount('#app');
	}
};

app.initialize();