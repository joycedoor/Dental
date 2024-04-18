Vue.component('error-popup', {
    props: ['message', 'visible'],
    template: `
        <div v-if="visible" class="error-popup">
            <svg class="error-icon" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="28" height="28" rx="14" fill="white" fill-opacity="0.24"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M22.3334 14.0003C22.3334 9.39795 18.6024 5.66699 14 5.66699C9.39765 5.66699 5.66669 9.39795 5.66669 14.0003C5.66669 18.6027 9.39765 22.3337 14 22.3337C18.6024 22.3337 22.3334 18.6027 22.3334 14.0003ZM14 9.20866C14.3452 9.20866 14.625 9.48848 14.625 9.83366V14.8337C14.625 15.1788 14.3452 15.4587 14 15.4587C13.6548 15.4587 13.375 15.1788 13.375 14.8337V9.83366C13.375 9.48848 13.6548 9.20866 14 9.20866ZM14 18.167C14.4603 18.167 14.8334 17.7939 14.8334 17.3337C14.8334 16.8734 14.4603 16.5003 14 16.5003C13.5398 16.5003 13.1667 16.8734 13.1667 17.3337C13.1667 17.7939 13.5398 18.167 14 18.167Z" fill="white"/>
            </svg>
            {{ message }}
        </div>
    `
});

new Vue({
    el: '#app',
    data: {
        currentStep: 1,
        zipCode: '',
        state: '',
        birthday: '',
        services: [],
        selectedServices: [],
        errorMessage: '', // 用于显示错误消息
        errorVisible: false,
        dataUrl : '',
        plans: [],
        filter: {},
        availablePlans: [],
        planDetails: {},
    },

    mounted() {
        this.initDatePicker();
        this.dataUrl = this.$el.dataset.url;
        this.services = this.computedServices;
    },
    methods: {
        initDatePicker() {
            const eighteenYearsAgo = new Date();
            eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

            this.pikaday = new Pikaday({
                field: document.getElementById('birthday'),
                format: 'YYYY-MM-DD',
                defaultDate: eighteenYearsAgo,
                setDefaultDate: false,
                i18n: {
                    previousMonth: 'Previous Month',
                    nextMonth: 'Next Month',
                    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                    weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                    weekdaysShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
                },
                onSelect: (date) => {
                    document.getElementById('birthday').value = date.toISOString().substring(0, 10);
                    this.birthday = date.toISOString().substring(0, 10);
                }
            });
        },
        showError() {
            this.errorVisible = true;
            setTimeout(() => {
                this.errorVisible = false;
            }, 5000);

        },
        goToPlanUrl(plan) {
            // 使用 fetch 来加载 JSON 数据
            fetch(this.dataUrl + 'plan_url.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    // 根据当前 state 筛选合适的数据条目
                    const statePlan = data.find(p => p.State === this.state);
                    if (!statePlan) {
                        console.error('No plan found for state:', this.state);
                        return;
                    }

                    // 从 plan.ID 中移除所有数字以获取 provider 名称
                    const provider = plan.ID.replace(/[0-9]/g, '');

                    // 获取对应的 URL
                    const url = statePlan[provider];
                    if (url) {
                        window.open(url, '_blank').focus(); // 如果 URL 存在，则打开链接
                    } else {
                        console.error('No URL found for provider:', provider);
                    }
                })
                .catch(error => {
                    console.error('Error fetching plan URLs:', error);
                });
        },
        ZipToState(callback) {
            fetch(`https://api.zippopotam.us/us/${this.zipCode}`)
                .then(response => {
                    if (!response.ok) throw new Error('Invalid Zip Code');
                    return response.json();
                })
                .then(data => {
                    if (data && data.places && data.places.length > 0) {
                        this.state = data.places[0]['state abbreviation'];

                        // 检查状态是否有对应的计划
                        return fetch(this.dataUrl + 'plan_filter.json')
                            .then(response => response.json())
                            .then(filterData => {
                                const filter = filterData.find(item => item.State === this.state);
                                if (!filter || !filter.Plans) {
                                    throw new Error('No Plans Available');
                                }
                                this.availablePlans = filter.Plans.split(', ').map(plan => plan.trim());
                                this.filter = filter;
                            });
                    } else {
                        throw new Error('Invalid Zip Code');
                    }
                })
                .then(() => {
                    // 状态验证通过且有对应计划，执行回调
                    callback();
                })
                .catch(error => {
                    this.errorMessage = error.message;
                    this.showError();
                });
        },
        isAdult: function() {
            const birthday = new Date(this.birthday);
            const today = new Date();
            const age = today.getFullYear() - birthday.getFullYear();
            const m = today.getMonth() - birthday.getMonth();

            if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
                return age - 1 >= 18;
            } else {
                return age >= 18;
            }
        },
        goToNextStep(stepChange) {
            if (stepChange === 1) {
                this.ZipToState(() => {
                    if (!this.isAdult()) {
                        this.errorMessage = "The Insured has to be an Adult to enroll";
                        this.showError();
                    } else {
                        this.currentStep += stepChange;
                        this.errorMessage = '';
                    }
                });
            } else {
                this.currentStep += stepChange;
                this.errorMessage = '';
            }
        },
        applyTranslation() {
            const wrapper = this.$el.querySelector('.steps-wrapper');
            wrapper.style.transform = `translateX(${this.translateXValue})`;
        },
        calculateEffectiveDate(planProvider) {
            const now = new Date();
            const day = now.getDate();
            let effectiveDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            if (planProvider === 'MWG') {
                if (day <= 20) {
                    // 如果当前日期小于20号，生效日期设置为下个月的1号
                    effectiveDate.setMonth(now.getMonth() + 1, 1);
                } else {
                    // 否则生效日期设置为下下个月的1号
                    effectiveDate.setMonth(now.getMonth() + 2, 1);
                }
            } else if (planProvider === 'Delta') {
                if (day < 15) {
                    // 如果当前日期小于15号，生效日期设置为这个月的15号
                    effectiveDate.setDate(15);
                } else {
                    // 否则生效日期设置为下个月的1号
                    effectiveDate.setMonth(now.getMonth() + 1, 1);
                }
            } else if (planProvider === 'UHC') {
                // UHC的保险次日生效
                effectiveDate.setDate(now.getDate() + 1);
            }

            // 格式化日期为 MM/DD/YYYY 格式
            const month = effectiveDate.getMonth() + 1;
            const date = effectiveDate.getDate();
            const year = effectiveDate.getFullYear();
            return `${month.toString().padStart(2, '0')}/${date.toString().padStart(2, '0')}/${year}`;
        },
        fetchPlans: function() {
            fetch(this.dataUrl + 'plan_data.json')
                .then(response => response.json())
                .then(data => {
                    // 筛选出对应的计划
                    let plans = this.availablePlans.map(planId =>
                        data.find(plan => plan.ID === planId)).filter(plan => plan !== undefined);

                    // 根据 selectedServices 调整顺序
                    if (this.selectedServices.includes(3)) {
                        plans = this.reorderPlans(plans, this.filter.D3_Selected_Highlight);
                    } else if (this.selectedServices.includes(2)) {
                        plans = this.reorderPlans(plans, this.filter.D2_Selected_Highlight);
                    } else {
                        plans = this.reorderPlans(plans, this.filter.D1_Selected_Highlight);
                    }

                    // 计算每个计划的起始日期并保存到 plan 对象中
                    plans.forEach(plan => {
                        plan.earliestEffectiveDate = this.calculateEffectiveDate(plan.ID); //
                    });

                    // 设置处理完的数据
                    this.plans = plans;
                    this.currentStep = 3;
                    this.errorMessage = '';

                    // 使用 setTimeout 来延迟执行
                    setTimeout(() => {
                        // 修改mask容器的overflow属性
                        const maskContainer = this.$el.querySelector('.mask');
                        if (maskContainer) {
                            maskContainer.style.overflow = 'visible';
                        }

                        // 将steps-wrapper容器中除了最后一个child之外的所有child设置为隐藏
                        const stepsWrapper = this.$el.querySelector('.steps-wrapper');
                        if (stepsWrapper) {
                            const children = stepsWrapper.children;
                            for (let i = 0; i < children.length - 1; i++) {
                                children[i].style.visibility = 'hidden';
                            }
                        }
                    }, 500);
                })
                .catch(error => {
                    console.error('Error loading the plan data:', error);
                    this.errorMessage = 'Failed to load data, please try again later.';
                });

        },
        // 辅助函数：根据给定的 highlight 对计划数组重新排序
        reorderPlans: function(plans, highlightPlan) {
            if (!highlightPlan) return plans; // 如果没有特别的 highlight 计划，返回原数组
            const highlight = plans.find(plan => plan.ID === highlightPlan);
            const others = plans.filter(plan => plan.ID !== highlightPlan);
            if (highlight) {
                return [highlight, ...others]; // 将 highlight 计划排在第一位
            }
            return plans; // 如果找不到特定的 highlight 计划，返回原始排序
        },
        selectService: function(serviceId) {
            let index = this.selectedServices.indexOf(serviceId);
            if (index > -1) {
                this.selectedServices.splice(index, 1);
            } else {
                this.selectedServices.push(serviceId);
            }
        },
    },
    computed: {
        translateXValue() {
            // 假设每一步都是100%的视图宽度，根据当前步骤计算需要滑动的距离
            const stepOffset = this.currentStep - 1;
            return -(stepOffset * 100) + '%';
        },
        computedServices() {
            if (smDentalData.lang === 'en') {
                return [
                    { id: 1, name: 'Preventive Procedure', detail: 'Teeth Cleaning / Oral X-Ray', checked: false },
                    { id: 2, name: 'Basic Procedure', detail: 'Fillings / Sealants', checked: false },
                    { id: 3, name: 'Major Procedure', detail: 'Oral Surgery / Root Canals / Dentures', checked: false },
                ];
            } else if (smDentalData.lang === 'cn') {
                return [
                    { id: 1, name: '预防性牙科项目', detail: '普通洗牙 / 口腔X-Ray', checked: false },
                    { id: 2, name: '基础牙科项目', detail: '补牙 / 封闭', checked: false },
                    { id: 3, name: '重大牙科项目', detail: '牙冠 / 拔牙 / 根管 / 假牙', checked: false },
                ];
            } else {
                return [];
            }
        }
    },
    watch: {
        // 监听currentStep变化，应用滑动效果
        currentStep() {
            this.applyTranslation();
        }
    },
});

