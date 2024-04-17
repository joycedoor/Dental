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
        showErrorAnimation: false,
        dataUrl : '',
        plans: [],
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
        ZipToState: function() {
            const zip = this.zipCode;
            fetch(`https://api.zippopotam.us/us/${zip}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Request failed');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data && data['places'] && data['places'].length > 0) {
                        this.state = data['places'][0]['state abbreviation'];
                        this.errorMessage = ''; // Clear any previous error messages
                    } else {
                        throw new Error('No data found');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    this.errorMessage = 'Zip Code Invalid';
                    this.state = '';
                });
        },
        isAdult: function() {
            const birthday = new Date(this.birthday); // 将生日字符串转换为日期对象
            const today = new Date(); // 获取当前日期
            const age = today.getFullYear() - birthday.getFullYear(); // 计算两个日期的年份差
            const m = today.getMonth() - birthday.getMonth(); // 计算月份差

            if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
                // 如果当前月份小于生日月份，或者月份相同但今天的日期小于生日日期，则年龄-1
                return age - 1 >= 18;
            } else {
                // 否则直接判断年龄
                return age >= 18;
            }
        },
        goToNextStep(stepChange) {
            // 前置条件检查
            console.log(this.isAdult());
            if (!this.zipCode || !this.birthday) {
                this.errorMessage = "所有字段都需要填写。";
                this.showErrorAnimation = true;
                setTimeout(() => {
                    this.showErrorAnimation = false;
                }, 500);

                return;
            }else if (this.zipCode.length != 5) {
                this.errorMessage = "请输入正确的Zip Code";
                this.showErrorAnimation = true;
                setTimeout(() => {
                    this.showErrorAnimation = false;
                }, 500);

                return;
            }

            const newStep = this.currentStep + stepChange;
            this.currentStep = newStep;
            this.errorMessage = '';
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
            // 通过API获取zipcode对应的州
            fetch(`https://api.zippopotam.us/us/${this.zipCode}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Zip Code Invalid');
                    }
                    return response.json();
                })
                .then(zipData => {
                    const stateAbbreviation = zipData['places'][0]['state abbreviation']; // 假设API返回的数据中州的缩写为state字段
                    // 获取过滤规则
                    fetch(this.dataUrl + 'plan_filter.json')
                        .then(response => response.json())
                        .then(filterData => {
                            // 根据州找到对应的过滤规则
                            const filter = filterData.find(item => item.State === stateAbbreviation);
                            if (!filter) {
                                this.errorMessage = 'Invalid Zip Code';
                                return; // 中止进一步执行
                            }
                            if (!filter.Plans) {
                                this.errorMessage = 'No Plans Available';
                                return; // 中止进一步执行
                            }
                            // 解析 Plans 数据，准备进行计划获取和排序
                            const availablePlans = filter.Plans.split(', ').map(plan => plan.trim());
                            // 获取计划数据
                            fetch(this.dataUrl + 'plan_data.json')
                                .then(response => response.json())
                                .then(data => {
                                    // 筛选出对应的计划
                                    let plans = availablePlans.map(planId =>
                                        data.find(plan => plan.ID === planId)).filter(plan => plan !== undefined);

                                    // 根据 selectedServices 调整顺序
                                    if (this.selectedServices.includes(3)) {
                                        plans = this.reorderPlans(plans, filter.D3_Selected_Highlight);
                                    } else if (this.selectedServices.includes(2)) {
                                        plans = this.reorderPlans(plans, filter.D2_Selected_Highlight);
                                    } else {
                                        plans = this.reorderPlans(plans, filter.D1_Selected_Highlight);
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
                        })
                        .catch(error => {
                            console.error('Error loading the filter data:', error);
                            this.errorMessage = 'Failed to load filter data, please try again later.';
                        });
                })
                .catch(error => {
                    console.error('Error fetching state data:', error);
                    this.errorMessage = error.message;
                });
            console.log(this.errorMessage);
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
