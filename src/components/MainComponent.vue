<template lang="pug">
div
    div(v-if='current_id == -1')
        v-card
            v-card-title А банан не хочешь?
    div(v-else)
        v-card(class='my-2')
            v-col(cols=12)
                v-btn(block dark color='blue lighten-1' @click='opened=!opened') <v-icon>mdi-settings</v-icon> Настройка поиска
            center(v-if='opened')
                v-divider
                v-card-subtitle Возраст от и до лет
                v-slider(:label="`От ${from_year} лет`" thumb-label :min=0 v-model='from_year' :max='to_year' type="number")
                v-slider(:label="`До ${to_year} лет`" thumb-label :max=100 v-model='to_year' :min='from_year' type="number")
                v-divider
                v-card-subtitle Выбор местоположения
                v-select(v-model='country' :items='countrys' item-text='title' item-value='id' label='Выберите страну')
                v-select(v-model='city' :items='cities' item-text='title' item-value='id' v-if='country' label='Выберите город')
                v-divider
                v-card-subtitle Выбор пола
                v-radio-group(v-model='sex')
                    v-radio(:value='0' label='Любой')
                    v-radio(:value='2' label='Мужской')
                    v-radio(:value='1' label='Женский')
            v-divider
            v-card-actions
                v-col(cols=6)
                    v-btn(block color='error' @click='arr=[]' :loading='is_loading')
                        v-icon mdi-notification-clear-all
                v-col(cols=6)
                    v-btn(block color='success' @click='refreshArr' :loading="is_loading")
                        v-icon mdi-magnify
        v-card(class='my-2' :color='filteredUsers.length>0 ? `success`: `error`')
            v-card-title <v-icon>{{ filteredUsers.length>0 ? 'mdi-check' : 'mdi-information' }}</v-icon> Результаты поиска
            v-card-subtitle(v-if='filteredUsers.length == 0') Походу никого нет...
            
            div(v-if='filteredUsers.length > 0')
                v-pagination(v-model="page" :length="Math.ceil(filteredUsers.length/20)" circle)
                v-card(class='my-4' v-for='user in filteredUsers.slice((page-1)*20, page*20)' :key='user.id')
                    center
                        a(:href='`https://vk.com/id${user.id}`')
                            v-img(:src='user.photo_200' max-width=200 position='center center')
                        v-card-text.title {{user.first_name}} {{user.last_name}}
                        v-card-subtitle Основные характеристики:
                        v-card-text.
                            Возраст {{user.bdate | getYears(user.from_to_year)}} лет<br>
                            Была онлайн {{Math.ceil((Date.now() / 1000 - user.last_seen.time)/60)}} минут назад
                        v-card-subtitle Побочные характеристики:
                        v-card-text.
                            Тест на Олега: {{user.oleg}}% <br>
                            Уровень IQ: {{ user.iq > 50 ? "Умпалумпа": user.iq}} <br>
                            Тест на наркотики: {{ user.drugs > 50 ? 'Я не торч, просто сладко дунул' : 'Я полноценный торч'}} <br>
                            Сохранена девственность: {{user.sex_saved > 85 ? "Да" : "Нет"}}<br>
                            Половых отношений пройдено: {{user.sex_completed}} {{ user.sex == 1 ? 'Парней' : user.sex ? 'Девушек': 'Инопланетян'}}<br>
                            {{ user.sex == 1 ? 'Глубина' : user.sex==2 ? 'Размер' : 'Пустота'}} {{user.size/10}} см<br>
                            Тест на кавказца: {{user.kavkaz > 30? 'Отвечаю Вася!': 0}}
                v-pagination(v-model="page" @input='$vuetify.goTo(0)' :length="Math.ceil(filteredUsers.length/20)" circle)
</template>

<script>
import vk_connect from "@vkontakte/vk-connect";
Array.prototype.sample = function() {
    return this[Math.floor(Math.random() * this.length)];
};
var app_id = 7167255;
var v = "5.102";
export default {
    name: "app",
    data: () => ({
        arr: [],
        token: "",
        session: "",
        from_year: 14,
        to_year: 18,
        sex: 1,
        is_loading: false,
        countrys: [],
        cities: [],
        regions: [],
        country: null,
        city: null,
        region: null,
        page: 1,
        opened: false,
        current_id: 0
    }),
    watch: {
        country: function(country_id) {
            this.cities = [];
            this.regions = [];
            vk_connect
                .sendPromise("VKWebAppCallAPIMethod", {
                    method: "database.getCities",
                    params: {
                        access_token: this.token,
                        v,
                        country_id,
                        count: 0
                    }
                })
                .then(r => {
                    for (
                        let offset = 0;
                        offset < r.response.count;
                        offset += 1000
                    ) {
                        vk_connect
                            .sendPromise("VKWebAppCallAPIMethod", {
                                method: "database.getCities",
                                params: {
                                    access_token: this.token,
                                    v,
                                    country_id,
                                    count: 1000,
                                    offset
                                }
                            })
                            .then(r => {
                                this.cities.push(...r.response.items);
                                this.cities = this.cities.sort(this.compareObj);
                            });
                    }
                });
            vk_connect
                .sendPromise("VKWebAppCallAPIMethod", {
                    method: "database.getRegions",
                    params: {
                        access_token: this.token,
                        v,
                        country_id,
                        count: 0
                    }
                })
                .then(r => {
                    for (
                        let offset = 0;
                        offset < r.response.count;
                        offset += 1000
                    ) {
                        vk_connect
                            .sendPromise("VKWebAppCallAPIMethod", {
                                method: "database.getRegions",
                                params: {
                                    access_token: this.token,
                                    v,
                                    country_id,
                                    count: 1000,
                                    offset
                                }
                            })
                            .then(r => {
                                this.regions.push(...r.response.items);
                                this.regions = this.regions.sort(
                                    this.compareObj
                                );
                            });
                    }
                });
        },
        region: function(region_id) {
            this.cities = [];
            vk_connect
                .sendPromise("VKWebAppCallAPIMethod", {
                    method: "database.getCities",
                    params: {
                        access_token: this.token,
                        v,
                        country_id: this.country,
                        region_id,
                        count: 0
                    }
                })
                .then(r => {
                    for (
                        let offset = 0;
                        offset < r.response.count;
                        offset += 1000
                    ) {
                        vk_connect
                            .sendPromise("VKWebAppCallAPIMethod", {
                                method: "database.getCities",
                                params: {
                                    access_token: this.token,
                                    v,
                                    country_id: this.country,
                                    region_id,
                                    count: 1000,
                                    offset
                                }
                            })
                            .then(r => {
                                this.cities.push(...r.response.items);
                                this.cities = this.cities.sort(this.compareObj);
                            });
                    }
                });
        }
    },
    methods: {
        addToBlack(id) {
            vk_connect.sendPromise("VKWebAppCallAPIMethod", {
                method: "account.ban",
                params: {
                    v,
                    access_token: this.token,
                    owner_id: id
                }
            });
            this.arr = this.arr.filter(r => r.id != id);
        },
        compareObj(a, b) {
            return a.title > b.title ? 1 : a.title < b.title ? -1 : 0;
        },
        addToFriends(id) {
            vk_connect.sendPromise("VKWebAppCallAPIMethod", {
                method: "friends.add",
                params: {
                    v,
                    access_token: this.token,
                    user_id: id,
                    text: this.texts.sample()
                }
            });
            this.arr = this.arr.filter(r => r.id != id);
        },
        refreshArr() {
            this.is_loading = true;
            this.arr = [];
            let opts = {
                fields:
                    "last_seen,can_write_private_message,can_send_friend_request,blacklisted_by_me,blacklisted,photo_200,bdate,sex",
                sex: this.sex,
                status: 6,
                has_photo: 1,
                country: this.country,
                city: this.city,
                count: 1000,
                v
            };
            let mass = [];
            for (let i = this.from_year; i < this.to_year; i++)
                mass.push(
                    vk_connect
                        .sendPromise("VKWebAppCallAPIMethod", {
                            method: "users.search",
                            params: {
                                ...opts,
                                access_token: this.token,
                                age_from: i,
                                age_to: i + 1
                            }
                        })
                        .then(r =>
                            this.arr.push(
                                ...r.response.items.map(r => {
                                    r.from_to_year = [i, i + 1];
                                    r.oleg = this.RandomFromTo(0, 100);
                                    r.drugs = this.RandomFromTo(0, 100);
                                    r.sex_completed = this.RandomFromTo(0, 50);
                                    r.sex_saved = this.RandomFromTo(0, 100);
                                    r.iq = this.RandomFromTo(0, 100);
                                    r.size = this.RandomFromTo(0, 500);
                                    r.kavkaz = this.RandomFromTo(0, 50);
                                    return r;
                                })
                            )
                        )
                );
            Promise.all(mass).then(r => {
                this.is_loading = false;
            });
        },
        RandomFromTo(from, to) {
            return Math.ceil(Math.random() * (to - from) + from);
        }
    },
    computed: {
        filteredUsers() {
            const result = [];
            const map = new Set();
            for (const item of this.arr) {
                if (!map.has(item.id)) {
                    map.add(item.id);
                    result.push({
                        ...item
                    });
                }
            }
            return result.filter(r => {
                try {
                    return (
                        !r.blacklisted_by_me &&
                        !r.blacklisted &&
                        r.can_send_friend_request &&
                        r.can_write_private_message &&
                        Date.now() / 1000 - r.last_seen.time < 3600 * 24 &&
                        !r.is_closed
                    );
                } catch {
                    console.log(r);
                    return false;
                }
            });
        }
    },
    filters: {
        getYears(v, v1) {
            if (!!v) {
                let date = v.split(".");
                if (date.length == 3) {
                    var ageDifMs =
                        Date.now() -
                        new Date(date[2], date[1], date[0]).getTime();
                    var ageDate = new Date(ageDifMs); // miliseconds from epoch
                    return Math.abs(ageDate.getUTCFullYear() - 1970);
                }
            }
            return `приблизительно от ${v1[0]} до ${v1[1]}`;
        }
    },
    components: {},
    mounted() {
        this.$vuetify.theme.dark = true;
        vk_connect
            .sendPromise("VKWebAppGetAuthToken", { app_id, scope: "friends" })
            .then(r => r.access_token)
            .then(access_token => {
                this.token = access_token;
                vk_connect.sendPromise("VKWebAppGetUserInfo", {}).then(r => {
                    if (r.country) {
                        this.country = r.country.id;
                    }
                    if (r.city) {
                        this.city = r.city.id;
                    }
                    this.current_id = r.id;
                });
                return vk_connect.sendPromise("VKWebAppCallAPIMethod", {
                    method: "database.getCountries",
                    params: { access_token, v, count: 1000 }
                });
            })
            .then(r => (this.countrys = r.response.items));
    }
};
</script>
