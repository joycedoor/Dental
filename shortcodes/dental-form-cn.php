<link href="https://fonts.googleapis.com/css?family=Lato:400,700&display=swap" rel="stylesheet">
<div id="app" data-url="<?php echo esc_url(SM_DENTAL_INSURANCE_DATA_URL); ?>">
    <error-popup :message="errorMessage" :visible="errorVisible"></error-popup>
    <div class="steps-nav">
        <div class="step" :class="{ 'active': currentStep === 1 }">
            <div class="step-label">
                <div>
                    ①
                </div>
                <div>
                    投保人信息
                </div>
            </div>
            <div class="step-bar"></div>
        </div>
        <div class="step" :class="{ 'active': currentStep === 2 }">
            <div class="step-label">
                <div>
                    ②
                </div>
                <div>
                    选择所需服务
                </div>
            </div>
            <div class="step-bar"></div>
        </div>
        <div class="step" :class="{ 'active': currentStep === 3 }">
            <div class="step-label">
                <div>
                    ③
                </div>
                <div>
                    选择计划
                </div>
            </div>
            <div class="step-bar"></div>
        </div>
    </div>

    <div class="title">找到适合您的保险计划</div>
    <div class="mask">
        <div class="steps-wrapper">
            <!-- 第一步 -->
            <div class="step-container">
                <div class="input-area-1">
                    <div class="input-box">
                        <img
                                loading="lazy"
                                src="<?php echo SM_DENTAL_INSURANCE_ASSETS_DIR . 'img/search.svg'; ?>"
                                class="img"
                        />
                        <input type="text" v-model="zipCode" class="input-label" required placeholder="输入您的邮编" :tabindex="currentStep === 1 ? 0 : -1">

                    </div>
                    <div class="input-box">
                        <img
                                loading="lazy"
                                src="<?php echo SM_DENTAL_INSURANCE_ASSETS_DIR . 'img/calender.svg'; ?>"
                                class="img"
                        />
                        <input type="text" id="birthday" v-model="birthday" readonly placeholder="选择您的出生日期" class="input-label" :tabindex="currentStep === 1 ? 0 : -1">

                    </div>
                </div>
                <div class="right-bg-pic">
                    <img
                            loading="lazy"
                            src="<?php echo SM_DENTAL_INSURANCE_ASSETS_DIR . 'img/bg1.png'; ?>"
                            class="bg-img"
                    />
                </div>
            </div>

            <!-- 第二步 -->
            <div class="step-container">
                <div class="input-area-2">
                    <div class="subtitle-wrapper">
                        <img
                                loading="lazy"
                                src="<?php echo SM_DENTAL_INSURANCE_ASSETS_DIR . 'img/downarrow.svg'; ?>"
                                class="img-down-arrow"
                        />
                        <div class="subtitle">
                            请选择您希望接受的牙科服务
                        </div>
                    </div>
                    <div v-for="service in services" :key="service.id" class="service-selection">
                        <div class="checkbox-label-container">
                            <input type="checkbox" :id="service.id" :value="service.id" @change="selectService(service.id)" :tabindex="currentStep === 2 ? 0 : -1">
                            <label :for="service.id" class="service-name">{{ service.name }}</label>
                        </div>
                        <span class="service-detail">{{ service.detail }}</span>
                    </div>
                    <div class="step2contact">
                        <p style="font-family: 'Lato', sans-serif; font-size: 16px; line-height: 22.4px"> 不确定您的牙科项目? <a href="https://smcovered.com/cn/support/contact-us/" target="_blank" style="font-weight: bold; text-decoration: underline;" :tabindex="currentStep === 2 ? 0 : -1">点击这里，联系我们</a> </p>
                    </div>
                </div>
                <div class="right-bg-pic">
                    <img
                            loading="lazy"
                            src="<?php echo SM_DENTAL_INSURANCE_ASSETS_DIR . 'img/bg2.png'; ?>"
                            class="bg-img"
                    />
                </div>
            </div>
            <!-- 第三步 -->
            <div class="step-container">
                <div id="plans-container" class="scroll-container">
                    <!-- 动态插入卡片，第一张的设计不同 -->
                    <div v-for="(plan, index) in plans" :key="plan.ID" class="dental-plan-card" :class="{ 'first-card': index === 0 }">
                        <!-- 条件渲染皇冠图标，只在第一张卡片显示 -->
                        <img v-if="index === 0" src="<?php echo SM_DENTAL_INSURANCE_ASSETS_DIR . 'img/crown-icon.svg'; ?>" class="crown-icon" alt="Crown Icon">
                        <div class="dental-plan-details">
                            <header class="dental-plan-header">
                                <div class="dental-plan-title">{{ plan.PlanCategory }}</div>
                                <p class="dental-plan-subtitle">{{ plan.PlanName }}</p>
                            </header>
                            <section class="dental-plan-features">
                                <div class="dental-plan-feature" v-for="trait in plan.TraitsCN" :key="trait">
                                    <svg viewBox="-1 -1 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" class="check-icon">
                                        <circle cx="16" cy="16" r="15" fill="black" stroke="none"/>
                                        <path d="M13.0159 19.6362L9.1052 15.7255L7.7782 17.0525L13.0159 22.2902L24.2696 11.0365L22.9426 9.70947L13.0159 19.6362Z" fill="white" stroke="white" stroke-width="2px"/>
                                    </svg>
                                    <p class="dental-plan-feature-text">{{ trait }}</p>
                                </div>
                            </section>
                            <footer class="dental-plan-footer">
                                <div class="dental-plan-pricing">
                                    <span class="dental-plan-pricing-label">每月</span>
                                    <span class="dental-plan-price">{{ plan.Price }}</span>
                                    <span class="dental-plan-pricing-label">起</span>
                                </div>
                                <div class="dental-plan-cta">
                                    <p class="dental-plan-effective-date">最早生效日期: {{plan.earliestEffectiveDate }}</p>
                                </div>
                            </footer>
                            <div class="buttons-container">
                                <a href="#" class="dental-plan-PN-link" @click="goToPNUrl(plan)">查询网络内牙科医生 ></a>
                                <button class="dental-plan-enroll-button" @click="goToPlanUrl(plan)">开始投保流程 ></button>
                            </div>
                        </div>
                    </div>
                    <div class="disclaimer">
                        <p style="font-family: 'Lato', sans-serif; font-size: 14px; line-height: 19.6px">
                            * 首月投保时，牙科保险提供方会收取一笔单次的 Enrollment Fee
                        </p>
                        <p style="font-family: 'Lato', sans-serif; font-size: 14px; line-height: 19.6px">
                            ** 以上信息不作为赔付依据，实际赔付细则请以牙科保险计划保单为准
                        </p>
                    </div>
                    <div class="step2contact" style="margin-top: 0px">
                        <p style="font-family: 'Lato', sans-serif; font-size: 18px; line-height: 25.2px"> 不确定您的牙科项目? <a href="https://smcovered.com/cn/support/contact-us/" target="_blank" style="font-weight: bold; text-decoration: underline;" :tabindex="currentStep === 3 ? 0 : -1">点击这里，联系我们</a> </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <button v-if="currentStep === 2" class="previous-step" type="button" @click="goToNextStep(-1)">上一步</button>
    <button v-if="currentStep === 1" class="next-step" type="button" @click="goToNextStep(1)">下一步</button>
    <button v-if="currentStep === 2" class="next-step" type="button" @click="fetchPlans">提交</button>
    <button v-if="currentStep === 3" class="previous-step" type="button" @click="goBackStep2">上一步</button>
</div>
