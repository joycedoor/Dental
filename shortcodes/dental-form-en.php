<link href="https://fonts.googleapis.com/css?family=Lato:400,700&display=swap" rel="stylesheet">
<div id="app" data-url="<?php echo esc_url(SM_DENTAL_INSURANCE_DATA_URL); ?>">
    <error-popup :message="errorMessage" :visible="errorVisible"></error-popup>
    <div class="steps-nav">
        <div class="step" :class="{ 'active': currentStep === 1 }">
            <div class="step-label">①  Member Info</div>
            <div class="step-bar"></div>
        </div>
        <div class="step" :class="{ 'active': currentStep === 2 }">
            <div class="step-label">②  Dental Services</div>
            <div class="step-bar"></div>
        </div>
        <div class="step" :class="{ 'active': currentStep === 3 }">
            <div class="step-label">③  Select Plans</div>
            <div class="step-bar"></div>
        </div>
    </div>

    <div class="title">Find dental plans that meet your needs</div>
    <div class="mask">
        <div class="steps-wrapper">
            <!-- 第一步 -->
            <div class="step-container">
                <div class="input-area">
                    <div class="input-box">
                        <img
                                loading="lazy"
                                src="<?php echo SM_DENTAL_INSURANCE_ASSETS_DIR . 'img/search.svg'; ?>"
                                class="img"
                        />
                        <input type="text" v-model="zipCode" class="input-label" required placeholder="Enter Your Zip Code">

                    </div>
                    <div class="input-box">
                        <img
                                loading="lazy"
                                src="<?php echo SM_DENTAL_INSURANCE_ASSETS_DIR . 'img/calender.svg'; ?>"
                                class="calender-icon"
                        />
                        <input type="text" id="birthday" v-model="birthday" readonly placeholder="Enter Your Date of Birth" class="input-label">

                    </div>
                </div>
                <div class="right-bg-pic">
                    <img
                            loading="lazy"
                            src="<?php echo SM_DENTAL_INSURANCE_ASSETS_DIR . 'img/bg2.svg'; ?>"
                            class="bg-img"
                    />
                </div>
            </div>

            <!-- 第二步 -->
            <div class="step-container">
                <div class="input-area">
                    <div class="subtitle-wrapper">
                        <img
                                loading="lazy"
                                src="<?php echo SM_DENTAL_INSURANCE_ASSETS_DIR . 'img/downarrow.svg'; ?>"
                                class="img"
                        />
                        <div class="subtitle">
                            Please select dental services you intend to receive
                        </div>
                    </div>
                    <div v-for="service in services" :key="service.id" class="service-selection">
                        <div class="checkbox-label-container">
                            <input type="checkbox" :id="service.id" :value="service.id" @change="selectService(service.id)">
                            <label :for="service.id" class="service-name">{{ service.name }}</label>
                        </div>
                        <span class="service-detail">{{ service.detail }}</span>
                    </div>

                </div>
                <div class="right-bg-pic">
                    <img
                            loading="lazy"
                            src="<?php echo SM_DENTAL_INSURANCE_ASSETS_DIR . 'img/bg1.svg'; ?>"
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
                                <div class="dental-plan-feature" v-for="trait in plan.Traits" :key="trait">
                                    <div class="checkmark-circle">
                                        <p>√</p>
                                    </div>
                                    <p class="dental-plan-feature-text">{{ trait }}</p>
                                </div>
                            </section>
                            <footer class="dental-plan-footer">
                                <div class="dental-plan-pricing">
                                    <span class="dental-plan-pricing-label">Starting From</span>
                                    <span class="dental-plan-price">{{ plan.Price }}</span>
                                    <span class="dental-plan-pricing-label">/month</span>
                                </div>
                                <div class="dental-plan-cta">
                                    <p class="dental-plan-effective-date">Earliest Coverage Effective Date: {{ plan.earliestEffectiveDate }}</p>
                                </div>
                            </footer>
                            <button class="dental-plan-enroll-button" @click="goToPlanUrl(plan)">Enroll Now > &gt;</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <button v-if="currentStep === 2" class="previous-step" type="button" @click="goToNextStep(-1)">Previous</button>
    <button v-if="currentStep === 1" class="next-step" type="button" @click="goToNextStep(1)">Next</button>
    <button v-if="currentStep === 2" class="next-step" type="button" @click="fetchPlans">Submit</button>
</div>
