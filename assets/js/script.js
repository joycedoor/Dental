Vue.component('error-popup', {
    props: ['message', 'visible'],
    template: `
        <div v-if="visible" class="error-popup">
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
        showPlaceholderzip: true,
        showPlaceholderbd: true,
        birthday: '',
        services: [
            { id: 1, name: '预防性牙科项目 Preventive Procedure', detail: '普通洗牙 / 口腔X-Ray', checked: false },
            { id: 2, name: '基础牙科项目 Basic Procedure', detail: '补牙 / 封闭', checked: false },
            { id: 3, name: '重大牙科项目 Major Procedure', detail: '牙冠 / 拔牙 / 根管 / 假牙', checked: false },
        ],
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
    },

    methods: {
        initDatePicker() {
            flatpickr(this.$refs.datepicker, {
                plugins: [
                    new yearDropdownPlugin({
                        date: "01/01/2000",
                        yearStart: 80,
                        yearEnd: -5
                    })
                ],
                altInput: true,
                altFormat: "F j, Y",
                dateFormat: "Y-m-d",
                shorthandCurrentMonth: true,

                onChange: (selectedDates, dateStr, instance) => {
                    this.birthday = dateStr; // 更新生日数据属性
                }
            });
        },
        showError() {
            this.errorVisible = true;
            setTimeout(() => {
                this.errorVisible = false;
            }, 5000);

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
        checkInput() {
            // 当 input 不为空时，隐藏占位符
            this.showPlaceholderzip = this.zipCode.length === 0;
            this.showPlaceholderbd = this.birthday.length === 0;
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
                    // 设置处理完的数据
                    this.plans = plans;
                    this.currentStep = 3;
                    this.errorMessage = '';
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
        }
    },
    watch: {
        // 监听currentStep变化，应用滑动效果
        currentStep() {
            this.applyTranslation();
        }
    },
});

