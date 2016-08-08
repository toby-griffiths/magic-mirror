///<reference path="../../typings/index.d.ts"/>

"use strict";

import * as Vue from "vue";
import {Category} from "./model/Category";
import {Answer} from "./model/Answer";
import {Fortune} from "./model/Fortune";
import {Events, States} from "../../server/connection/Connection";
import Socket = SocketIOClient.Socket;

export const PAGE_CATEGORY_SELECT = "categorySelect";
export const PAGE_QUESTION_ASKER = "questionAsker";

/**
 * Main App class
 */
export class App {
    public static registerComponents() {
        require("./component/UserFormComponent");
        require("./component/CategorySelectorComponent");
        require("./component/QuestionAskerComponent");
        require("./component/FortuneComponent");
        require("./component/CategoryIconComponent");
    }

    private socket: Socket;

    private _vue: vuejs.Vue;

    private _categories: CategoryList = {};

    private _fortunes = {};

    /**
     * @constructor
     *
     * @param el
     */
    constructor(private el: string) {
        App.registerComponents();
    }

    /**
     * Boots the app
     */
    boot(): void {
        this.socket = io();

        this.initializeVue();

        this.socket.on(Events.setState, (state) => {
            console.log("New state: " + state);
            this._vue.$set("state", state);
        });

        // @todo - Remove debugging lines
        this.socket.on("id", function (id) {
            console.log("ID: " + id);
        });

        this.socket.on("reset", this.reset);
        this.socket.on("setQueuePosition", this.setQueuePosition);
        this.socket.on("setCategory", this.setCategory);
        this.socket.on("setAnswer", this.setAnswer);
    }

    private initializeVue() {

        let socket = this.socket;
        let app = this;

        this._vue = new Vue({
            el: this.el,
            data: {
                app: this,
                page: PAGE_CATEGORY_SELECT,
                state: null,
                queuePosition: 1,
                currentCategory: null,
                currentQuestionNo: null,
                answers: {},
            },
            methods: {
                reset: function () {
                    socket.emit("reset");
                },
                setCategory: function (category: Category) {
                    socket.emit("setCategory", category.name);
                },
                getCurrentQuestion: function () {
                    let categoryQuestions = this.$get("currentCategory").questions;
                    let questionNo = this.$get("currentQuestionNo");

                    return categoryQuestions[questionNo];
                },
                setAnswer: function (answer: Answer) {
                    socket.emit("setAnswer", this.currentQuestionNo, answer.sequence);
                },
                getFortune: function () {
                    return app.getFortune(this.currentCategory.name, this.answers);
                },
                displayStart: function () {
                    return (States.start === this.state);
                },
                displayMain: function () {
                    return (States.host === this.state || States.activeUser === this.state);
                },
                displayPending: function () {
                    return (States.pendingUser === this.state);
                },
                displayCategorySelector: function () {
                    return (this.page === PAGE_CATEGORY_SELECT);
                },
                displayQuestionAsker: function () {
                    return (this.page === PAGE_QUESTION_ASKER && !this.displayFortune());
                },
                displayFortune: function () {
                    return (
                        this.currentCategory
                        && Object.keys(this.answers).length === Object.keys(this.currentCategory.questions).length
                    );
                },
            }
        });

        window["vue"] = this._vue;
    }

    reset = () => {
        this._vue.$set("page", PAGE_CATEGORY_SELECT);
        this._vue.$set("currentCategory", null);
        this._vue.$set("currentQuestionNo", null);
        this._vue.$set("answers", {});
    };

    /**
     * Handler for setQueuePosition event
     *
     * @param position
     */
    setQueuePosition = (position: number) => {
        this._vue.$set("queuePosition", position);
    };

    setCategory = (categoryName: string) => {
        this._vue.$set("currentCategory", this.categories[categoryName]);
        this._vue.$set("currentQuestionNo", 1);
        this._vue.$set("page", PAGE_QUESTION_ASKER);
    };

    setAnswer = (questionNo, answerKey) => {
        console.log("setAnswer", questionNo, answerKey);
        Vue.set(this._vue.$data.answers, questionNo, answerKey);
        this._vue.$set("currentQuestionNo", this._vue.$get("currentQuestionNo") + 1);
    };

    // -----------------
    // Getters & Setters
    // -----------------

    /**
     * @returns {Category[]}
     */
    get categories(): CategoryList {
        return this._categories;
    }

    /**
     * Adds a category to the available categories
     *
     * @param category
     */
    public addCategory(category: Category): void {
        this._categories[category.name] = category;
    }

    public addFortune(categoryName: string, fortune: Fortune) {
        this._fortunes[categoryName] = this._fortunes[categoryName] || {};
        this._fortunes[categoryName][fortune.answer1] = this._fortunes[categoryName][fortune.answer1] || {};
        this._fortunes[categoryName][fortune.answer1][fortune.answer2] = this._fortunes[categoryName][fortune.answer1][fortune.answer2] || {};

        this._fortunes[categoryName][fortune.answer1][fortune.answer2][fortune.answer3] = fortune;
    }

    public getFortune(categoryName: string, answers: {answer1: string, answer2: string, answer3: string}): Fortune {
        return this._fortunes[categoryName][answers[1]][answers[2]][answers[3]];
    }
}


export interface CategoryList {
    [index: string]: Category;
}