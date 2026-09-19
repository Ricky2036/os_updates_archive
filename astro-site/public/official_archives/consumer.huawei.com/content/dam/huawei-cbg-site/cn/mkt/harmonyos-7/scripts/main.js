!(function() {
    'use strict'

    ScrollTrigger.clearScrollMemory('auto')

    // TODO MARK: Delete
    // window.screenLog && window.screenLog.init({resourceError: true})
    // console.log(`🍖 ${window.innerWidth} × ${window.innerHeight}`)

    const html = document.documentElement
    const isRTL = html.getAttribute('dir') === 'rtl'
    const main = document.getElementById('hmos')

    const Breakpoint = {
        isXS: window.matchMedia('(max-aspect-ratio: 7/10)'),
        isMD: window.matchMedia('(max-aspect-ratio: 12/10)'),
        isHover: window.matchMedia('(hover: hover) and (pointer: fine)'),
    }

    const Viewport = (() => {
        const isXS = Breakpoint.isXS.matches
        const isMD = Breakpoint.isMD.matches && !isXS
        const isLG = !isXS && !isMD
        const isLGHover = !isXS && !isMD && Breakpoint.isHover.matches
        return {isXS, isMD, isLG,isLGHover}
    })()

    const breakpoints = [Breakpoint.isXS, Breakpoint.isMD]
    breakpoints.forEach(breakpoint => breakpoint.addEventListener('change', () => {
        const hasFancy = document.querySelector('.cbg-jwplayer') !== null
        const hasModal = html.classList.contains('has-modal-l')
        if (hasFancy || hasModal) return
        window.location.reload()
    }))

    const Browser = (() => {
        const ua = navigator.userAgent.toLowerCase()
        return {
            isUC: /ucbrowser/i.test(ua),
            isWeChat: /micromessenger/i.test(ua),
            isSafari: /safari/i.test(ua) && !/chrome|crios/i.test(ua),
        }
    })()

    const Support = {
        webp: document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp'),
        hover: Breakpoint.isHover.matches,
        inlineVideo: !(Browser.isUC || Browser.isWeChat),
    }

    const scrub = Support.hover ? 0.5 : 0
    gsap.defaults({duration: 1})
    // Swiper.extendDefaults({a11y: {enabled: false}})

    Object.assign(HTMLVideoElement.prototype, {
        safeAction(action) {
            if (!Support.inlineVideo && !this.controls) return
            const execute = () => {
                const result = this[action]()
                if (result && result.catch) result.catch(() => {})
            }
            (this.readyState >= 3) ? execute() : this.addEventListener('canplay', execute, {once: true})
        },
        safeReplay() {
            this.currentTime = 0
            this.safeAction('play')
        },
        safePlay() {
            this.safeAction('play')
        },
        safePause() {
            this.safeAction('pause')
        },
    })

    // · MARK: Speed
    const speed = {
        slide: Viewport.isLG ? 800 : 600,
        fade: Viewport.isLG ? 600 : 400,
    }

    // · MARK: U
    const U = {
        rpx(lg, md = lg, xs = md) {
            const r = Viewport.isLG ? {px: lg, base: 1920} : Viewport.isMD ? {px: md, base: 1400} : {px: xs, base: 720}
            return Math.round(r.px / r.base * window.innerWidth)
        },
        addClass(element, classname) {
            return () => element.classList.add(classname)
        },
        removeClass(element, classname) {
            return () => element.classList.remove(classname)
        },
        setEqualHeights(selector) {
            const els = Array.from(main.querySelectorAll(selector))
            const maxHeight = els.reduce((max, el) => Math.max(max, el.offsetHeight), 0)
            els.forEach(el => el.style.height = `${maxHeight}px`)
        },
        outCube(n) {
            return --n * n * n + 1
        },
        getTop(target) {
            let top = 0
            while (target.offsetParent) {
                top += target.offsetTop
                target = target.offsetParent
            }
            return top
        },
        smoothScrollTo(target, offset = 0, duration = 800, callback = () => {}) {
            let startTime
            const documentHeight = document.documentElement.scrollHeight
            const viewportHeight = window.innerHeight
            const maxScrollY = Math.max(0, documentHeight - viewportHeight)
            const startY = window.scrollY
            const onScroll = timestamp => {
                startTime = startTime || timestamp
                const elapsed = timestamp - startTime
                const progress = Math.min(elapsed / duration, 1)
                const targetY = Math.max(0, Math.min(typeof target === 'number' ? target : U.getTop(target) - offset, maxScrollY))
                const distance = targetY - startY
                const scrollPos = startY + distance * U.outCube(progress)
                window.scrollTo(0, scrollPos)
                elapsed < duration ? requestAnimationFrame(onScroll) : callback()
            }
            requestAnimationFrame(onScroll)
        },
        onEnterAddClass(triggers, classname = 'animated', p1 = 'top 85%', markers = false) {
            triggers = typeof triggers === 'string' ? main.querySelectorAll(triggers) : triggers
            triggers.forEach(trigger => {
                ScrollTrigger.create({trigger, start: p1, end: p1, markers, once: true, onEnter: () => trigger.classList.add(classname)})
            })
        },
        toggleAnimatedClass(triggers, p1 = 'top 85%', p2 = 'top bottom', markers = false) {
            triggers = typeof triggers === 'string' ? main.querySelectorAll(triggers) : triggers
            triggers.forEach(trigger => {
                ScrollTrigger.create({trigger, start: p1, end: p1, markers, onEnter: () => trigger.classList.add('animated')})
                ScrollTrigger.create({trigger, start: p2, end: p2, markers, onEnterBack: () => trigger.classList.remove('animated')})
            })
        },
        debounce(fn, delay = 200) {
            let timeoutId
            return function(...args) {
                clearTimeout(timeoutId)
                timeoutId = setTimeout(() => fn.apply(this, args), delay)
            }
        },
    }

    // · MARK: Helper
    const Helper = {
        init() {
            this.getScrollbarBuffer()
            this.fancyPlayer()
            this.analytics()
            this.footnotes()
        },
        getScrollbarBuffer() {
            const scrollbarBuffer = Viewport.isLG ? window.innerWidth - document.body.clientWidth : 0
            html.style.setProperty('--modal-scrollbar-buffer', scrollbarBuffer + 'px')
        },
        fancyPlayer() {
            $('.player-button').on('click', function(event) {
                event.preventDefault()
                $(this).initH5player({target: 'fancybox'})
            })
        },
        analytics() {
            const prefix = 'data-ga-'
            const cache = new WeakMap()
            const toCamelCase = str => str.slice(8).replace(/-(\w)/g, (_, k) => k.toUpperCase())
            const getData = target => {
                let data = {}
                for (const {name, value} of target.attributes) {
                    if (!name.startsWith(prefix)) continue
                    data[toCamelCase(name)] = value
                }
                return data
            }
            const getCacheData = target => {
                let data = cache.get(target)
                if (!data) {
                    data = getData(target)
                    cache.set(target, data)
                }
                return data
            }
            main.addEventListener('click', event => {
                event.stopPropagation()
                const target = event.target.closest('[data-ga-event]')
                if (target) dataLayer.push(getCacheData(target))
            })
        },
        footnotes() {
            const section = main.querySelector('.section-footnote')
            if (!section) return
            const addIcon = () => {
                const lang = html.lang.toLowerCase()
                const space = lang.startsWith('zh') || lang.startsWith('ja') ? '' : '&nbsp;'
                const lis = section.querySelectorAll('li[id]')
                lis.forEach(li => li.insertAdjacentHTML('beforeend', `${space}<i></i>`))
            }
            addIcon()
            let startY = 0
            let swiperActiveVideo = null
            const handleIconClick = target => {
                if (target.tagName !== 'I' || target.parentElement.tagName !== 'LI') return
                const shouldSkipVideo = !Support.inlineVideo || !swiperActiveVideo || swiperActiveVideo.parentElement.classList.contains('ended')
                U.smoothScrollTo(startY, 0, 800, () => {
                    if (shouldSkipVideo) return
                    swiperActiveVideo.safePlay()
                    swiperActiveVideo = null
                })
                const currentFootnote = section.querySelector('li.current')
                if (currentFootnote) currentFootnote.classList.remove('current')
            }
            const handleSwiperVideo = target => {
                const parentSwiperEl = target.closest('.swiper')
                if (!parentSwiperEl) return
                const swiper = parentSwiperEl.swiper
                if (!swiper) return
                if (swiper.autoplay.running) swiper.autoplay.stop()
                if (!Support.inlineVideo) return
                swiperActiveVideo = parentSwiperEl.querySelector('.swiper-slide-active video')
                if (!swiperActiveVideo) return
                swiper.isInteracted = true
                swiperActiveVideo.safePause()
            }
            const handleFootnoteClick = target => {
                if (!target.hasAttribute('data-footnote') || target.closest('.section-modal')) return
                const previousFootnote = section.querySelector('li.current')
                if (previousFootnote) previousFootnote.classList.remove('current')
                const targetFootnote = section.querySelector(`#footnote-${target.dataset.footnote}`)
                if (!targetFootnote) return
                targetFootnote.classList.add('current')
                U.smoothScrollTo(targetFootnote, 200)
                handleSwiperVideo(target)
                startY = window.scrollY
            }
            main.addEventListener('click', event => {
                event.stopPropagation()
                const target = event.target
                handleIconClick(target)
                handleFootnoteClick(target)
            })
        },
    }

    // · MARK: Inline Media
    const InlineMedia = {
        videos: main.querySelectorAll('.inline-video'),
        mainObserver: null,
        dataMap: new WeakMap(),
        pathPrefix: window.location.protocol === 'file:' ? '../' : '/',
        videoEvents: ['play', 'pause', 'ended'],
        classNames: {
            noInlineVideo: 'no-inline-video',
            playbackStates: ['playing', 'paused', 'ended'],
            swiperVideo: 'swiper-video',
            swiperSlide: 'swiper-slide',
            videoContainer: 'video-container',
            slideVideo: 'slide-video',
            playPauseButton: 'play-pause-button',
            replayButton: 'replay-button',
            startFrame: '--start-frame',
            startFrameMask: 'start-frame-mask',
            lazyloaded: 'lazyloaded',
            played: 'played',
            paused: 'paused',
        },
        defaults: {
            videoExtension: 'mp4',
            posterExtension: 'jpg',
            fallbackExtension: 'jpg',
            loadRootMargin: '1000px 120%',
            secondLoadRootMargin: '0px 120%',
            playRootMarginLoop: '100px 0px',
            playThreshold: 0.65,
        },
        init() {
            if (!Support.inlineVideo) main.classList.add(this.classNames.noInlineVideo)
            this.initMainObserver()
            this.initSwiperObservers()
            this.videos.forEach(video => {
                const data = this.getVideoData(video)
                if (data) this.initVideo(video, data)
            })
        },
        getOptions(video) {
            const options = new Set((video.dataset.options || '').split(',').map(option => option.trim()))
            const getAttr = (name, defaultValue) => video.getAttribute(name) || defaultValue
            return {
                hasPreload: options.has('preload'),
                hasAutoplay: options.has('autoplay'),
                hasAutoplayLG: options.has('autoplay-lg'),
                isKV: options.has('kv'),
                hasMD: options.has('md'),
                hasXS: options.has('xs'),
                disableLG: options.has('disable-lg'),
                disableXS: options.has('disable-xs'),
                disablePoster: options.has('disable-poster'),
                disableThumb: options.has('disable-thumb'),
                disableStartFrame: options.has('disable-start-frame'),
                disableFallbackFrame: options.has('disable-fallback-frame'),
                hasStartFrameMask: options.has('start-frame-mask'),
                hasWatchState: options.has('watch-state'),
                hasPlayPauseButton: options.has('play-pause-button'),
                hasEnterReplay: options.has('enter-replay'),
                videoExtension: getAttr('data-video-extension', this.defaults.videoExtension),
                posterExtension: getAttr('data-poster-extension', this.defaults.posterExtension),
                fallbackFrameExtension: getAttr('data-fallback-frame-extension', this.defaults.fallbackExtension),
                playRootMargin: getAttr('data-play-root-margin', video.loop ? this.defaults.playRootMarginLoop : '0px'),
                playThreshold: video.loop ? 0 : parseFloat(getAttr('data-play-threshold')) || this.defaults.playThreshold,
                hasControls: video.controls,
            }
        },
        getSources(video, options) {
            const basePath = video.dataset.basePath
            const mdSuffix = options.hasMD ? '-pad' : ''
            const xsSuffix = options.hasXS ? '-xs' : mdSuffix
            const viewportSuffix = Viewport.isXS ? xsSuffix : (Viewport.isMD ? mdSuffix : '')
            const fullPath = `${basePath}${viewportSuffix}`
            const startFrameName = `${fullPath}-poster`
            return {
                video: `${fullPath}.${options.videoExtension}`,
                startFrame: `${startFrameName}.${options.posterExtension}`,
                startFrameThumb: `${startFrameName}-thumb.${options.posterExtension}`,
                fallbackFrame: `${fullPath}.${options.fallbackFrameExtension}`,
                fallbackFrameThumb: `${fullPath}-thumb.${options.fallbackFrameExtension}`,
            }
        },
        getVideoData(video) {
            const videoContainer = video.closest(`.${this.classNames.videoContainer}`)
            if (!videoContainer) return
            const options = this.getOptions(video)
            if ((options.disableXS && Viewport.isXS) || (options.disableLG && Viewport.isLG)) return
            if (options.hasWatchState || options.hasPlayPauseButton || videoContainer.querySelector(`.${this.classNames.playPauseButton}`)) videoContainer.classList.add(this.classNames.paused)
            const sources = this.getSources(video, options)
            return {videoContainer, options, sources}
        },
        initMainObserver() {
            if (this.mainObserver) return
            this.mainObserver = this.createObserver((video, observer) => {
                this.loadVideoFromMap(video, this.dataMap, observer)
            }, {rootMargin: this.defaults.loadRootMargin})
        },
        createObserver(callback, options = {}) {
            return new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return
                    callback(entry.target, observer)
                })
            }, options)
        },
        loadVideoFromMap(video, dataMap, observer) {
            const data = dataMap.get(video)
            if (!data) return
            this.loadVideo(video, data)
            dataMap.delete(video)
            observer.unobserve(video)
        },
        initSwiperObservers() {
            const swiperEls = main.querySelectorAll(`.${this.classNames.swiperVideo}`)
            swiperEls.forEach(swiperEl => {
                const videos = swiperEl.querySelectorAll(`.${this.classNames.slideVideo}`)
                if (!videos.length) return
                const dataMap = new WeakMap()
                let loadedCount = 0
                let visibleCount = 0
                requestAnimationFrame(() => visibleCount = this.getSlideVideoVisibleCount(videos))
                const firstObserver = this.createObserver((video, observer) => {
                    this.loadVideoFromMap(video, dataMap, observer)
                    loadedCount++
                    if (loadedCount >= visibleCount) {
                        observer.disconnect()
                        this.initSecondObserver(swiperEl, dataMap)
                    }
                }, {rootMargin: this.defaults.loadRootMargin})
                videos.forEach(video => {
                    dataMap.set(video, this.getVideoData(video))
                    firstObserver.observe(video)
                })
            })
        },
        getSlideVideoVisibleCount(videos) {
            const winWidth = window.innerWidth
            let count = 0
            videos.forEach(video => {
                const slide = video.closest(`.${this.classNames.swiperSlide}`)
                const {left, right} = slide.getBoundingClientRect()
                if (left < winWidth && right > 0) count++
            })
            return count
        },
        initSecondObserver(swiperEl, dataMap) {
            const secondObserver = this.createObserver((video, observer) => {
                this.loadVideoFromMap(video, dataMap, observer)
            }, {root: swiperEl, rootMargin: this.defaults.secondLoadRootMargin})
            const unloadedVideos = swiperEl.querySelectorAll(`.${this.classNames.slideVideo}:not([src])`)
            unloadedVideos.forEach(video => secondObserver.observe(video))
        },
        initVideo(video, data) {
            const {videoContainer, options, sources} = data
            this.loadThumbnail(video, options, sources)
            if (options.hasPreload) {
                this.loadVideo(video, data)
            } else {
                if (!video.classList.contains(this.classNames.slideVideo)) {
                    this.dataMap.set(video, data)
                    this.mainObserver.observe(video)
                }
            }
            this.onPlay(video, videoContainer, options)
        },
        loadThumbnail(video, options, sources) {
            if (options.disablePoster || options.disableThumb) return
            let posterUrl = ''
            if (Support.inlineVideo || options.hasControls) {
                if (options.disableStartFrame) return
                posterUrl = sources.startFrameThumb
            } else {
                if (options.disableFallbackFrame) return
                posterUrl = sources.fallbackFrameThumb
            }
            if (posterUrl) video.poster = posterUrl
        },
        loadVideo(video, data) {
            const {videoContainer, options, sources} = data
            this.loadPoster(video, options, sources)
            this.loadVideoSource(video, options, sources)
            this.watchPlaybackState(video, videoContainer, options)
            this.handlePlayPauseButton(video, videoContainer, options)
            this.applyStartFrameMask(videoContainer, options, sources)
        },
        loadPoster(video, options, sources) {
            if (options.disablePoster) return
            const useStartFrame = Support.inlineVideo || options.hasControls
            if (useStartFrame && options.disableStartFrame) return
            if (!useStartFrame && options.disableFallbackFrame) return
            const posterUrl = useStartFrame ? sources.startFrame : sources.fallbackFrame
            const posterImage = new Image()
            posterImage.onload = posterImage.onerror = () => {
                video.poster = posterUrl
                video.classList.add(this.classNames.lazyloaded)
            }
            posterImage.src = posterUrl
        },
        loadVideoSource(video, options, sources) {
            if (!Support.inlineVideo && !options.hasControls) return
            video.src = sources.video
            video.load()
            video.addEventListener('canplay', () => video.classList.add(this.classNames.lazyloaded), {once: true})
        },
        watchPlaybackState(video, videoContainer, options) {
            if (!options.hasWatchState && !options.hasPlayPauseButton) return
            const updateState = () => {
                videoContainer.classList.remove(...this.classNames.playbackStates)
                const state = video.ended ? 'ended' : (video.paused ? 'paused' : 'playing')
                videoContainer.classList.add(state)
            }
            this.videoEvents.forEach(eventName => video.addEventListener(eventName, () => {
                if (eventName === 'play') video.classList.add(this.classNames.played)
                updateState()
            }))
        },
        handlePlayPauseButton(video, videoContainer, options) {
            if (!options.hasPlayPauseButton) return
            const button = videoContainer.querySelector(`.${this.classNames.playPauseButton}`)
            if (!button) return
            const isReplayOnly = button.classList.contains(this.classNames.replayButton)
            button.addEventListener('click', event => {
                event.preventDefault()
                event.stopPropagation()
                if (isReplayOnly) return video.safeReplay()
                const shouldPlay = video.paused || video.ended
                if (shouldPlay && video.ended) video.currentTime = 0
                video.safeAction(shouldPlay ? 'play' : 'pause')
            })
        },
        applyStartFrameMask(videoContainer, options, sources) {
            if (!Support.inlineVideo || !options.hasStartFrameMask) return
            videoContainer.classList.add(this.classNames.startFrameMask)
            const url = `${sources.startFrame.startsWith('/') ? '' : this.pathPrefix}${sources.startFrame}`
            videoContainer.style.setProperty(this.classNames.startFrame, `url('${url}')`)
        },
        onPlay(video, videoContainer, options) {
            if (!Support.inlineVideo || !options.hasAutoplay) return
            if (options.isKV) {
                video.safePlay()
            } else {
                this.createObserver((_, observer) => {
                    if (!Viewport.isLG && options.hasAutoplayLG) return
                    video.safePlay()
                    if (!options.hasEnterReplay) observer.disconnect()
                }, {rootMargin: options.playRootMargin, threshold: options.playThreshold}).observe(videoContainer)
            }
        },
    }

    // · MARK: Modal
    class Modal {
        static classNames = {
            hasModal: 'has-modal-l',
            openButton: 'modal-open',
            container: 'modal-container',
            wrapper: 'modal-wrapper',
            videoContainer: 'video-container',
            closeButton: 'modal-close-button',
            focus: 'modal-focus',
            scrollable: 'modal-scrollable',
            lazyload: 'lazyload',
            lazyloading: 'lazyloading',
            lazyloaded: 'lazyloaded',
        }
        static data = {
            id: 'data-modal-open',
            preload: 'data-modal-preload',
            footnote: 'data-footnote',
        }
        constructor(openButton) {
            const modalId = openButton.getAttribute(Modal.data.id)
            const section = document.getElementById(modalId)
            this.elements = {
                openButton,
                section,
                container: section.querySelector(`.${Modal.classNames.container}`),
                wrapper: section.querySelector(`.${Modal.classNames.wrapper}`),
                closeButton: section.querySelector(`.${Modal.classNames.closeButton}`),
                videos: section.querySelectorAll('video'),
                images: section.querySelectorAll('img'),
            }
            this.hasVideo = this.elements.videos.length > 0
            this.hasImage = this.elements.images.length > 0
            this.isOpening = false
            this.isClosing = false
            this.isOpened = false
            this.openDuration = 800
            this.closeDuration = 600
            this.bindEventHandlers()
            this.onViewportLoad()
        }
        bindEventHandlers() {
            this.onOpen = this.onOpen.bind(this)
            this.onOpenComplete = this.onOpenComplete.bind(this)
            this.onClose = this.onClose.bind(this)
            this.onCloseComplete = this.onCloseComplete.bind(this)
            this.elements.openButton.addEventListener('click', this.onOpen)
            this.elements.section.addEventListener('click', this.onClose)
        }
        onViewportLoad() {
            const preloadObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return
                    this.onPreloadImage()
                    this.onPreloadVideo()
                    observer.disconnect()
                })
            }, {rootMargin: '1000px 0px'})
            preloadObserver.observe(this.elements.openButton)
            const scrollableObserver = new ResizeObserver(() => this.isContentScrollable())
            scrollableObserver.observe(this.elements.openButton)
        }
        isContentScrollable() {
            const isScrollable = this.elements.wrapper.scrollHeight + U.rpx(128, 128, 160) > window.innerHeight
            this.elements.section.classList.toggle(Modal.classNames.scrollable, isScrollable)
        }
        onPreloadImage() {
            if (!this.hasImage) return
            this.elements.images.forEach(image => {
                if (!image.hasAttribute(Modal.data.preload)) return
                image.classList.add(Modal.classNames.lazyload)
            })
        }
        onPreloadVideo() {
            if (!this.hasVideo) return
            this.elements.videos.forEach(video => {
                const data = InlineMedia.getVideoData(video)
                const {options, sources} = data
                InlineMedia.loadThumbnail(video, options, sources)
                if (!video.hasAttribute(Modal.data.preload)) return
                InlineMedia.loadVideo(video, data)
            })
        }
        onOpenLoadImage() {
            if (this.isOpened || !this.hasImage) return
            this.elements.images.forEach(image => {
                if (!image.classList.contains(Modal.classNames.lazyloading) && !image.classList.contains(Modal.classNames.lazyloaded)) {
                    image.classList.add(Modal.classNames.lazyload)
                }
            })
        }
        onOpenLoadVideo() {
            if (!this.hasVideo) return
            this.elements.videos.forEach(video => {
                if (this.isOpened && video.classList.contains(Modal.classNames.lazyloaded)) return
                const data = InlineMedia.getVideoData(video)
                InlineMedia.loadVideo(video, data)
            })
        }
        onPlayVideo() {
            if (!this.hasVideo) return
            const io = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return
                    entry.target.safePlay()
                    observer.unobserve(entry.target)
                })
            }, {
                root: this.elements.section,
                threshold: 0.65,
            })
            this.elements.videos.forEach(video => io.observe(video))
        }
        resetVideoTime() {
            if (!this.hasVideo) return
            this.elements.videos.forEach(video => {
                if (!Support.inlineVideo && !video.controls) return
                video.closest(`.${Modal.classNames.videoContainer}`).classList.remove('ended')
                video.safePause()
                video.currentTime = 0
            })
        }
        onOpen() {
            this.elements.section.focus()
            document.documentElement.classList.add(Modal.classNames.hasModal)
            this.elements.section.classList.add(Modal.classNames.openButton)
            setTimeout(() => this.onOpenComplete(), this.openDuration)
            this.isOpening = true
        }
        onOpenComplete() {
            this.elements.section.classList.add(Modal.classNames.focus)
            this.elements.section.focus()
            this.onOpenLoadImage()
            this.onOpenLoadVideo()
            this.onPlayVideo()
            this.isOpening = false
            this.isOpened = true
        }
        onClose(event) {
            const isContainer = event.target === this.elements.container
            const isCloseButton = event.target.closest(`.${Modal.classNames.closeButton}`)
            if (!(isContainer || isCloseButton) && !(this.isOpening || this.isClosing)) return
            this.isClosing = true
            this.elements.section.classList.remove(Modal.classNames.openButton)
            setTimeout(() => this.onCloseComplete(), this.closeDuration)
            if (!this.hasVideo) return
            this.elements.videos.forEach(video => video.safePause())
        }
        onCloseComplete() {
            this.isClosing = false
            document.documentElement.classList.remove(Modal.classNames.hasModal)
            this.elements.section.classList.remove(Modal.classNames.focus)
            this.elements.section.scrollTop = 0
            this.resetVideoTime()
        }
    }

    // · MARK: TabNav Swiper
    class TabNavSwiper {
        static types = {
            x: 'tabnav-x',
            y: 'tabnav-y',
            xPill: 'tabnav-x-pill',
            xLine: 'tabnav-x-line',
            yLine: 'tabnav-y-line',
            yIcon: 'tabnav-y-icon',
            noVideo: 'tabnav-novideo',
            tabSlide: 'tabnav-slide',
            arrowFade: 'arrow-fade',
            arrowNoFade: 'arrow-nofade',
        }
        static classNames = {
            swiper: 'tabnav-swiper',
            slide: 'tabnav-slide',
            content: 'tabnav-content',
            track: 'tabnav-track',
            container: 'tabnav-container',
            wrapper: 'tabnav-wrapper',
            tabList: 'tabnav-list',
            tabItem: 'tabnav-item',
            label: 'tabnav-label',
            current: 'current',
            indicator: 'tabnav-indicator',
            captionList: 'tabnav-caption-list',
            caption: 'tabnav-caption',
            collapse: 'tabnav-collapse',
            disableTransitions: 'disable-transitions',
            video: 'inline-video',
            videoPlayed: 'played',
            playPauseButton: 'play-pause-button',
            start: '--tabnav-start',
            size: '--tabnav-size',
        }
        constructor(section, swiperInstance = null) {
            this.section = section
            this.swiper = swiperInstance
            this.elements = this.getElements(section)
            this.isTypeY = section.classList.contains(TabNavSwiper.types.y)
            this.isTypeYIcon = this.isTypeY && section.classList.contains(TabNavSwiper.types.yIcon)
            this.isTypeSlide = !Viewport.isLG && section.classList.contains(TabNavSwiper.types.tabSlide)
            this.isTypeArrowFade = !Viewport.isLG && section.classList.contains(TabNavSwiper.types.arrowFade)
            this.isTypeArrowNoFade = !Viewport.isLG && section.classList.contains(TabNavSwiper.types.arrowNoFade)
            this.noLineIndicator = this.isTypeYIcon && Viewport.isLG
            this.noVideo = section.classList.contains(TabNavSwiper.types.noVideo)
            this.isTabY = this.isTypeY && Viewport.isLG
            this.effect = this.elements.swiper.dataset.effect || 'fade'
            this.isFadeEffect = this.effect === 'fade'
            this.speed = speed[this.effect] || 500
            this.duration = this.speed / 1000
            this.currentIndex = 0
            this.tabPositions = []
            this.videoSlides = this.getVideoSlides()
            this.prevVideo = null
            this.currVideo = null
            this.transitionTimeoutID = null
            this.resizeObserver = null
            this.init()
        }
        init() {
            this.initSwiper()
            this.initTabNav()
        }
        getElements(section) {
            return {
                swiper: section.querySelector(`.${TabNavSwiper.classNames.swiper}`),
                slides: section.querySelectorAll(`.${TabNavSwiper.classNames.slide}`),
                content: section.querySelector(`.${TabNavSwiper.classNames.content}`),
                track: section.querySelector(`.${TabNavSwiper.classNames.track}`),
                container: section.querySelector(`.${TabNavSwiper.classNames.container}`),
                wrapper: section.querySelector(`.${TabNavSwiper.classNames.wrapper}`),
                tabList: section.querySelector(`.${TabNavSwiper.classNames.tabList}`),
                tabItems: section.querySelectorAll(`.${TabNavSwiper.classNames.tabItem}`),
                indicator: section.querySelector(`.${TabNavSwiper.classNames.indicator}`),
                captionList: section.querySelector(`.${TabNavSwiper.classNames.captionList}`),
                captions: section.querySelectorAll(`.${TabNavSwiper.classNames.caption}`),
                labels: [],
                collapses: [],
            }
        }
        initSwiper() {
            if (this.swiper) return
            if(this.isTypeSlide){
                this.swiper = new Swiper(this.elements.swiper, {
                    slidesPerView: "auto",
                    spaceBetween: U.rpx(24, 24, 32),
                    speed: this.speed,
                    followFinger: true,
                    keyboard: {enabled: true},
                    navigation: {
                        prevEl: this.section.querySelector('.arrownav-prev'),
                        nextEl: this.section.querySelector('.arrownav-next'),
                        disabledClass: 'arrownav-disabled',
                    },
                    on: {
                        init: swiper => this.updateCurrentTabIndex(swiper),
                        slideChange: swiper => this.updateCurrentTabIndex(swiper),
                    },
                })
            }else if(this.isTypeArrowFade){
                let isFeed = true;
                if(this.section.classList.contains('xiaoyi-power-swiper')){
                    isFeed = false
                }
                this.swiper = new Swiper(this.elements.swiper, {
                    effect: "fade",
                    fadeEffect: {crossFade: isFeed},
                    speed: this.speed,
                    followFinger: true,
                    keyboard: {enabled: true},
                    navigation: {
                        prevEl: this.section.querySelector('.arrownav-prev'),
                        nextEl: this.section.querySelector('.arrownav-next'),
                        disabledClass: 'arrownav-disabled',
                    },
                    on: {
                        init: swiper => this.updateCurrentTabIndex(swiper),
                        slideChange: swiper => this.updateCurrentTabIndex(swiper),
                    },
                })
            }else if(this.isTypeArrowNoFade){
                 this.swiper = new Swiper(this.elements.swiper, {
                    speed: this.speed,
                    followFinger: true,
                    spaceBetween: U.rpx(24, 24, 32),
                    keyboard: {enabled: true},
                    navigation: {
                        prevEl: this.section.querySelector('.arrownav-prev'),
                        nextEl: this.section.querySelector('.arrownav-next'),
                        disabledClass: 'arrownav-disabled',
                    },
                    on: {
                        init: swiper => this.updateCurrentTabIndex(swiper),
                        slideChange: swiper => this.updateCurrentTabIndex(swiper),
                    },
                })
            }else{
                this.swiper = new Swiper(this.elements.swiper, {
                    effect: this.effect,
                    speed: this.speed,
                    fadeEffect: {crossFade: true},
                    followFinger: !this.isFadeEffect,
                    keyboard: {enabled: true},
                    // allowTouchMove: true,
                    allowTouchMove: !this.noVideo,
                    // a11y: {enabled: false},
                    on: {
                        init: swiper => this.updateCurrentTabIndex(swiper),
                        slideChange: swiper => this.updateCurrentTabIndex(swiper),
                    },
                })
            }
        }
        initTabNav() {
            this.resetTransitions()
            this.handleVideoPlayback()
            this.isTabY ? this.initTabY() : this.initTabX()
        }
        updateCurrentTabIndex(swiper) {
            this.section.dataset.currentTab = swiper.activeIndex
        }
        resetTransitions() {
            this.elements.content.classList.add(TabNavSwiper.classNames.disableTransitions)
            clearTimeout(this.transitionTimeoutID)
            this.transitionTimeoutID = setTimeout(() => this.elements.content.classList.remove(TabNavSwiper.classNames.disableTransitions), 200)
        }
        getVideoSlides() {
            const videos = Array.from(this.elements.slides, slide => slide.querySelector(`.${TabNavSwiper.classNames.video}`))
            const hasPlayPauseButton = videos.map(video => video && video.dataset.options.includes(TabNavSwiper.classNames.playPauseButton))
            return {videos, hasPlayPauseButton}
        }
        handleVideoPlayback() {
            if (!Support.inlineVideo) return
            if (this.noVideo) return
            this.swiper.on('transitionStart', swiper => {
                this.prevVideo = this.videoSlides.videos[swiper.previousIndex]
                if (this.prevVideo && !this.isFadeEffect) this.prevVideo.safePause()
            })
            this.swiper.on('transitionEnd', swiper => {
                const {previousIndex, activeIndex} = swiper
                this.prevVideo = this.videoSlides.videos[previousIndex]
                this.currVideo = this.videoSlides.videos[activeIndex]
                if (this.prevVideo) {
                    if (this.isFadeEffect) this.prevVideo.safePause()
                    if (!this.videoSlides.hasPlayPauseButton[previousIndex]) this.prevVideo.currentTime = 0
                }
                if (this.currVideo) {
                    if (!this.videoSlides.hasPlayPauseButton[activeIndex] || !this.currVideo.classList.contains(TabNavSwiper.classNames.videoPlayed)) {
                        if (this.currVideo.ended) this.currVideo.currentTime = 0
                        this.currVideo.safePlay()
                    }
                }
            })
        }
        initTabX() {
            this.updateXStates()
            this.updateXData()
            this.resizeX()
            this.bindXEvents()
        }
        updateXStates() {
            this.toggleCurrentClass(this.elements.tabItems, this.currentIndex)
            this.toggleCurrentClass(this.elements.captions, this.currentIndex)
        }
        toggleCurrentClass(elements, currentIndex) {
            elements.forEach((element, index) => {
                element.classList.toggle(TabNavSwiper.classNames.current, index === currentIndex)
            })
        }
        resizeX() {
            const resizeObserver = new ResizeObserver(() => this.updateXData())
            resizeObserver.observe(this.elements.tabList)
        }
        updateXData() {
            this.resetTransitions()
            this.getXPositions()
            this.updateXIndicator()
        }
        getXPositions() {
            this.tabPositions = Array.from(this.elements.tabItems, (tab, index) => ({
                start: this.getXStart(tab, index),
                size: tab.clientWidth,
            }))
        }
        getXStart(tab, index) {
            if (index === 0) return 0
            let start = tab.offsetLeft
            if (isRTL) start = -(this.elements.tabList.clientWidth - start - tab.clientWidth)
            return start
        }
        updateXIndicator() {
            this.updateIndicator(this.currentIndex)
            this.scrollToCenterIfNeeded()
        }
        updateIndicator(index) {
            if (this.noLineIndicator) return
            const {start, size} = this.tabPositions[index]
            this.elements.indicator.style.setProperty(TabNavSwiper.classNames.start, `${start}px`)
            this.elements.indicator.style.setProperty(TabNavSwiper.classNames.size, `${size}px`)
        }
        scrollToCenterIfNeeded() {
            const viewportWidth = document.body.clientWidth
            const containerWidth = this.elements.container.scrollWidth
            const isScrollable = containerWidth > viewportWidth
            if (!isScrollable) return
            const {start, size} = this.tabPositions[this.currentIndex]
            const tabCenter = this.elements.wrapper.offsetLeft + Math.abs(start) + size / 2
            const viewportCenter = viewportWidth / 2
            const maxScrollLeft = containerWidth - viewportWidth
            let scrollLeft = tabCenter > viewportCenter ? Math.min(tabCenter - viewportCenter, maxScrollLeft) : 0
            if (isRTL) scrollLeft = -scrollLeft
            gsap.to(this.elements.track, {scrollLeft, duration: this.duration, ease: 'sine.out'})
        }
        bindXEvents() {
            this.swiper.on('slideChange', swiper => {
                this.currentIndex = swiper.activeIndex
                this.updateXStates()
                this.updateXIndicator()
            })
            this.handleTabClick('tabItem')
        }
        handleTabClick(tab) {
            this.elements.tabList.addEventListener('click', event => {
                const clickedTab = event.target.closest(`.${TabNavSwiper.classNames[tab]}`)
                if (!clickedTab) return
                const tabIndex = Array.from(this.elements[`${tab}s`]).indexOf(clickedTab)
                if (tabIndex !== this.currentIndex) this.swiper.slideTo(tabIndex)
            })
        }
        initTabY() {
            this.getYElements()
            this.updateYData()
            this.resizeY()
            this.bindYEvents()
        }
        getYElements() {
            this.elements.captions.forEach((caption, index) => {
                caption.className = TabNavSwiper.classNames.caption
                const collapse = document.createElement('div')
                collapse.className = TabNavSwiper.classNames.collapse
                collapse.append(caption)
                this.elements.tabItems[index].append(collapse)
            })
            this.elements.labels = this.section.querySelectorAll(`.${TabNavSwiper.classNames.label}`)
            this.elements.collapses = this.section.querySelectorAll(`.${TabNavSwiper.classNames.collapse}`)
        }
        resizeY() {
            const resizeObserver = new ResizeObserver(() => this.updateYData())
            this.elements.labels.forEach((label, index) => {
                resizeObserver.observe(label)
                resizeObserver.observe(this.elements.captions[index])
            })
        }
        updateYData() {
            const collapse = this.elements.collapses[this.currentIndex]
            collapse.style.height = ''
            collapse.style.height = `${collapse.scrollHeight}px`
            this.getYPositions()
            this.resetTransitions()
            this.updateIndicator(this.currentIndex)
        }
        getYPositions() {
            this.tabPositions = Array.from(this.elements.labels, (label, index) => ({
                start: index <= this.currentIndex ? label.offsetTop : (label.offsetTop - this.elements.collapses[this.currentIndex].scrollHeight),
                size: label.scrollHeight + this.elements.collapses[index].scrollHeight,
            }))
        }
        bindYEvents() {
            this.swiper.on('slideChange', swiper => {
                const {previousIndex, activeIndex} = swiper
                this.currentIndex = activeIndex
                this.updateIndicator(activeIndex)
                this.toggleCollapse(previousIndex, activeIndex)
                this.toggleCurrentClass(this.elements.tabItems, activeIndex)
            })
            this.handleTabClick('label')
        }
        toggleCollapse(previousIndex, activeIndex) {
            const collapse = this.elements.collapses[previousIndex]
            collapse.style.height = `${collapse.scrollHeight}px`
            requestAnimationFrame(() => collapse.style.height = 0)
            const expand = this.elements.collapses[activeIndex]
            expand.style.height = `${expand.scrollHeight}px`
        }
    }

    // · MARK: Sequence Frame
    class SequenceFrame {
        static classNames = {
            container: 'sticky-container',
            sticky: 'sticky',
            canvas: 'canvas-item',
        }
        static data = {
            step: 'data-step',
            basePath: 'data-base-path',
            frameCount: 'data-frame-count',
        }
        static defaults = {
            preloadRootMargin: '1500px 0px',
            cover: true,
            webp: true,
            extension: '.png',
            maxDiff: 10,
            maxSkip: 1,
            onStart(self) {
                // ScrollTrigger.create({
                //     trigger: self.elements.container,
                //     start: 'top top',
                //     end: 'bottom bottom',
                //     scrub: 0,
                //     onUpdate: s => self.renderFrames(s.progress * self.lastFrameIndex),
                // })
            },
        }
        constructor(section, options = {}) {
            this.section = typeof section === 'string' ? main.querySelector(section) : section
            this.options = {...SequenceFrame.defaults, ...options}
            this.elements = this.getElements()
            this.context = this.elements.canvas.getContext('2d')
            this.basePath = this.elements.canvas.getAttribute(SequenceFrame.data.basePath)
            this.frameCount = Number(this.elements.canvas.getAttribute(SequenceFrame.data.frameCount))
            this.lastFrameIndex = this.frameCount - 1
            this.extension = this.options.webp && Support.webp ? '.webp' : this.options.extension
            this.frames = new Array(this.frameCount).fill(null)
            this.loadedFlags = new Uint8Array(this.frameCount)
            this.loadedIndexes = []
            this.lastDrawnFrameIndex = -1
            this.dx = 0
            this.dy = 0
            this.dWidth = 0
            this.dHeight = 0
            this.currentFrame = 0
            this.targetFrame = 0
            this.currentStep = 0
            this.requestID = null
            this.resizeTimeoutID = null
            this.init()
        }
        init() {
            this.updateStickyTop()
            this.bindResizeEvent()
            this.observePreload()
        }
        getElements() {
            return {
                container: this.section.querySelector(`.${SequenceFrame.classNames.container}`),
                sticky: this.section.querySelector(`.${SequenceFrame.classNames.sticky}`),
                canvas: this.section.querySelector(`.${SequenceFrame.classNames.canvas}`),
            }
        }
        bindResizeEvent() {
            // window.addEventListener('resize', () => {
            //     clearTimeout(this.resizeTimeoutID)
            //     this.resizeTimeoutID = setTimeout(() => {
            //         this.updateStickyTop()
            //         this.updateCanvasMetrics()
            //         this.drawFrame(this.currentFrame)
            //     }, 200)
            // })
        }
        updateStickyTop() {
            const top = (window.innerHeight - this.elements.sticky.clientHeight) / 2
            this.elements.sticky.style.top = `${top}px`
        }
        updateCanvasMetrics() {
            const safeIndex = this.getSafeIndex(this.currentFrame)
            if (safeIndex === -1) return
            const frame = this.frames[safeIndex]
            if (!frame || !frame.complete) return
            const dpr = Math.max(window.devicePixelRatio || 2, 2)
            const width = this.elements.canvas.clientWidth * dpr
            const height = this.elements.canvas.clientHeight * dpr
            if (this.elements.canvas.width !== width) this.elements.canvas.width = width
            if (this.elements.canvas.height !== height) this.elements.canvas.height = height
            const scale = this.getScale(width / frame.width, height / frame.height)
            this.dWidth = frame.width * scale
            this.dHeight = frame.height * scale
            this.dx = (width - this.dWidth) / 2
            this.dy = (height - this.dHeight) / 2
        }
        getSafeIndex(index = this.currentFrame) {
            if (this.isLoaded(index)) return index
            return this.getNearestLoadedIndex(index)
        }
        getScale(wRatio, hRatio) {
            return this.options.cover ? Math.max(wRatio, hRatio) : Math.min(wRatio, hRatio)
        }
        isLoaded(index) {
            return index >= 0 && index < this.frameCount && this.frames[index] !== null
        }
        getNearestLoadedIndex(index) {
            if (this.isLoaded(index)) return index
            const arr = this.loadedIndexes
            const len = arr.length
            if (len === 0) return -1
            let left = 0
            let right = len
            while (left < right) {
                const mid = (left + right) >> 1
                if (arr[mid] < index) {
                    left = mid + 1
                } else {
                    right = mid
                }
            }
            const next = arr[left]
            const prev = arr[left - 1]
            if (prev === null && next === null) return -1
            if (prev === null) return next
            if (next === null) return prev
            return (index - prev <= next - index) ? prev : next
        }
        drawFrame(index) {
            const safeIndex = this.getNearestLoadedIndex(index)
            if (safeIndex === -1) return
            if (safeIndex === this.lastDrawnFrameIndex) return
            const frame = this.frames[safeIndex]
            if (!frame) return
            this.context.clearRect(0, 0, this.elements.canvas.width, this.elements.canvas.height)
            this.context.drawImage(frame, this.dx, this.dy, this.dWidth, this.dHeight)
            this.lastDrawnFrameIndex = safeIndex
        }
        observePreload() {
            const observer = new IntersectionObserver(async entries => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue
                    observer.disconnect()
                    try {
                        await this.loadAllFrames()
                        this.cacheLoadedIndexes()
                        this.updateCanvasMetrics()
                        this.drawFrame(this.currentFrame)
                        this.onStart()
                        this.onScroll()
                    } catch (error) {
                        console.error(error)
                    }
                    break
                }
            }, {rootMargin: this.options.preloadRootMargin})
            observer.observe(this.section)
        }
        async loadAllFrames(concurrency = 8) {
            let cursor = 0
            const worker = async() => {
                while (cursor < this.frameCount) {
                    const index = cursor++
                    await this.loadFrame(index)
                }
            }
            await Promise.all(Array.from({length: concurrency}, worker))
        }
        loadFrame(index) {
            return new Promise(resolve => {
                const image = new Image()
                image.decoding = 'async'
                const cleanup = () => {
                    image.onload = null
                    image.onerror = null
                }
                image.onload = () => {
                    cleanup()
                    this.frames[index] = image
                    this.loadedFlags[index] = 1
                    resolve(null)
                }
                image.onerror = () => {
                    cleanup()
                    this.frames[index] = null
                    resolve(index)
                }
                image.src = this.getFrameSrc(index)
            })
        }
        getFrameSrc(index) {
            return `${this.basePath}${String(index).padStart(1, '0')}${this.extension}`
        }
        cacheLoadedIndexes() {
            const indexes = []
            for (let i = 0; i < this.frameCount; i++) {
                if (this.loadedFlags[i]) indexes.push(i)
            }
            this.loadedIndexes = indexes
        }
        onStart() {
            if (typeof this.options.onStart === 'function') this.options.onStart(this)
        }
        onScroll() {
            if (typeof this.options.onScroll === 'function') this.options.onScroll(this)
        }
        onUpdate(frameIndex) {
            if (typeof this.options.onUpdate === 'function') this.options.onUpdate(this, frameIndex)
        }
        setStep(step) {
            if (this.currentStep === step) return
            this.currentStep = step
            this.elements.sticky.setAttribute(SequenceFrame.data.step, step)
        }
        renderFrames(frame) {
            this.targetFrame = Math.round(frame)
            if (!this.requestID) this.render()
        }
        renderFramesAuto(fulltime){
            if(this.lastDrawnFrameIndex > -1){
                this.currentFrame = this.lastDrawnFrameIndex
            }
            const diff = this.targetFrame - this.currentFrame
            if (diff === 0) {
                this.requestID = null
                return
            }
            const sign = Math.sign(diff)
            const delta = Math.abs(diff) > this.options.maxDiff ? sign * this.options.maxSkip : sign
            this.currentFrame += delta
            this.drawFrame(this.currentFrame)
            this.onUpdate(this.currentFrame)
            this.requestID = setTimeout(() => this.renderFramesAuto(fulltime),fulltime/this.lastFrameIndex)
        }
        render() {
            
            const diff = this.targetFrame - this.currentFrame
            if (diff === 0) {
                this.requestID = null
                return
            }
            const sign = Math.sign(diff)
            const delta = Math.abs(diff) > this.options.maxDiff ? sign * this.options.maxSkip : sign
            this.currentFrame += delta
            this.drawFrame(this.currentFrame)
            this.onUpdate(this.currentFrame)
            this.requestID = requestAnimationFrame(() => this.render())
        }
    }

    // · MARK: Page
    const Page = {
        init() {
            this.shiningButton()
            this.staggeredFadeup()
            this.hero2()
            this.lightShadow()
            this.sp3dSwiper()
            this.sectionMoveTop()
            this.xiaoyiIntro()
            this.performanceIntro()
            this.performanceMode()
            this.performanceSpace()
            this.performanceAi()
            this.safetyIntro()
            this.safetyAi()
            this.connectIntro()
            this.loveMore()
            this.carouselSwipers()
            this.carouselDemo03()
            this.handleSwiperTransition()
        },
        shiningButton(){
            class ParticleSystem {
                constructor(container) {
                    this.container = container;
                    this.particles = [];
                    this.isActive = false;
                    this.animationId = null;
                    
                    // 改进的粒子配置
                    this.particleConfig = {
                        count: 30,      // 更多粒子
                        minSize: 0.5,   // 稍大尺寸
                        maxSize: 2,     // 最大尺寸增加
                        speed: 0.8,     // 稍快速度
                        colors: ['#D0DEFF', '#FFFFFF', '#A0BDFF']
                    };
                }

                createParticle() {
                    const particle = document.createElement('div');
                    particle.className = 'particle';

                    // 随机尺寸
                    const size = Math.random() * (this.particleConfig.maxSize - this.particleConfig.minSize) + this.particleConfig.minSize;
                    particle.style.width = `${size}px`;
                    particle.style.height = `${size}px`;
                    
                    // 随机起始位置
                    const angle = Math.random() * Math.PI * 2;
                    const radius = U.rpx(24);
                    const x = radius + Math.cos(angle) * radius * 0.8;
                    const y = radius + Math.sin(angle) * radius * 0.8;
                    
                    particle.style.left = `${x}px`;
                    particle.style.top = `${y}px`;
                    
                    // 随机颜色
                    const colorIndex = Math.floor(Math.random() * this.particleConfig.colors.length);
                    particle.style.backgroundColor = this.particleConfig.colors[colorIndex];
                    
                    // 添加发光效果
                    const glowIntensity = 1 + Math.random() * 4;
                    particle.style.boxShadow = `0 0 ${glowIntensity}px ${this.particleConfig.colors[colorIndex]}`;
                    
                    // 随机速度方向
                    const speed = (Math.random() * 0.5 + 0.5) * this.particleConfig.speed;
                    const direction = Math.random() * Math.PI * 2;
                    
                    particle.vx = Math.cos(direction) * speed;
                    particle.vy = Math.sin(direction) * speed;
                    
                    // 透明度变化
                    particle.targetOpacity = 0.4 + Math.random() * 0.3;
                    particle.opacity = 0;
                    particle.style.opacity = particle.opacity;
                    
                    this.container.appendChild(particle);
                    return particle;
                }

                activate() {
                    if (this.isActive) return;
                    
                    this.isActive = true;
                    
                    // 创建粒子
                    for (let i = 0; i < this.particleConfig.count; i++) {
                        setTimeout(() => {
                            const particle = this.createParticle();
                            this.particles.push(particle);
                            
                            // 淡入动画
                            let opacity = 0;
                            const fadeIn = setInterval(() => {
                                opacity += 0.05;
                                particle.style.opacity = opacity;
                                if (opacity >= particle.targetOpacity) {
                                    clearInterval(fadeIn);
                                }
                            }, 20);
                        }, i * 30);
                    }
                    
                    // 开始动画
                    this.animate();
                }

                deactivate() {
                    if (!this.isActive) return;
                    
                    this.isActive = false;
                    
                    // 淡出粒子
                    this.particles.forEach(particle => {
                        let opacity = parseFloat(particle.style.opacity);
                        const fadeOut = setInterval(() => {
                            opacity -= 0.05;
                            particle.style.opacity = opacity;
                            if (opacity <= 0) {
                                clearInterval(fadeOut);
                            }
                        }, 20);
                    });
                    
                    // 停止动画
                    if (this.animationId) {
                        cancelAnimationFrame(this.animationId);
                        this.animationId = null;
                    }
                    
                    // 移除粒子
                    setTimeout(() => {
                        this.particles.forEach(particle => {
                            if (particle.parentNode) {
                                particle.parentNode.removeChild(particle);
                            }
                        });
                        this.particles = [];
                    }, 800);
                }

                animate() {
                    if (!this.isActive) return;
                    
                    const radius = U.rpx(24);
                    
                    this.particles.forEach((particle, index) => {
                        if (!particle.style.left || !particle.style.top) return;
                        
                        let x = parseFloat(particle.style.left);
                        let y = parseFloat(particle.style.top);
                        
                        // 更新位置
                        x += particle.vx;
                        y += particle.vy;
                        
                        // 边界检测和反弹
                        const dx = x - radius;
                        const dy = y - radius;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance > radius * 0.85) {
                            // 计算反弹
                            const angle = Math.atan2(dy, dx);
                            x = radius + Math.cos(angle) * (radius * 0.85 - 1);
                            y = radius + Math.sin(angle) * (radius * 0.85 - 1);
                            
                            // 反转速度
                            const dot = particle.vx * Math.cos(angle) + particle.vy * Math.sin(angle);
                            particle.vx = -1.8 * dot * Math.cos(angle) + particle.vx;
                            particle.vy = -1.8 * dot * Math.sin(angle) + particle.vy;
                            
                            // 添加一些随机性
                            particle.vx += (Math.random() - 0.5) * 0.15;
                            particle.vy += (Math.random() - 0.5) * 0.15;
                            
                            // 限制最大速度
                            const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                            if (speed > this.particleConfig.speed * 2) {
                                particle.vx = (particle.vx / speed) * this.particleConfig.speed;
                                particle.vy = (particle.vy / speed) * this.particleConfig.speed;
                            }
                            
                            // 碰撞时闪烁
                            particle.style.filter = 'brightness(1.5)';
                            setTimeout(() => {
                                particle.style.filter = 'brightness(1)';
                            }, 100);
                        }
                        
                        // 轻微上下浮动
                        if (index % 3 === 0) {
                            particle.vy += Math.sin(Date.now() * 0.001 + index) * 0.02;
                        }
                        
                        particle.style.left = `${x}px`;
                        particle.style.top = `${y}px`;
                    });
                    
                    this.animationId = requestAnimationFrame(() => this.animate());
                }
            }

            // 初始化粒子系统
            if(!Viewport.isLGHover) return
                const buttons = main.querySelectorAll('.common-button-item');
                buttons.forEach(button=>{
                    let particleSystem
                    if(button.classList.contains('shining-button-item')&&!button.classList.contains('arrownav-disabled')){
                        const particlesContainer = button.querySelector('.particles');
                        particleSystem = new ParticleSystem(particlesContainer);
                    }
                    button.addEventListener('mouseenter', () => {
                        if(button.classList.contains('shining-button-item')&&!button.classList.contains('arrownav-disabled')){
                            particleSystem.activate();
                        }
                    });
                    
                    button.addEventListener('mouseleave', () => {
                        if(button.classList.contains('shining-button-item')&&!button.classList.contains('arrownav-disabled')){
                            particleSystem.deactivate();
                        }
                    });
                })
        },
        staggeredFadeup() {
            U.toggleAnimatedClass('.staggered-fadeup')
        },
        hero2() {
            var arcPath = document.getElementById("arcPath");

            var endYStart = 1.0;
            var maxLift = Viewport.isXS?0.05:0.15;
            var maxDip = Viewport.isXS?0.03:0.1;
            function drawArc(t) {
                var E = endYStart - maxLift * t;
                var dipNow = maxDip * t;
                var controlY = 1;

                var d = "M 0,0 L 1,0 " +
                        "L 1," + E.toFixed(4) + " " +
                        "Q 0.5," + controlY.toFixed(4) +
                        " 0," + E.toFixed(4) + " " +
                        "L 0,0 Z";

                arcPath.setAttribute("d", d);
            }
            ScrollTrigger.create({
                trigger: main.querySelector('.section-hero .hero-container'),
                start: () => (Viewport.isLG ? 'bottom bottom' : 'bottom bottom'),
                end: () => (Viewport.isLG ? 'bottom center' : 'bottom center'),
                scrub: .5,
                onUpdate: s => drawArc(s.progress),
            })
            gsap.timeline({
                scrollTrigger: {
                    trigger: main.querySelector('.section-hero .hero-container'),
                    start: () => (Viewport.isLG ? 'bottom bottom' : 'bottom 80%'),
                    end: () => (Viewport.isLG ? 'bottom 20%' : 'bottom 0'),
                    scrub: .5,
                    invalidateOnRefresh: true,
                },
            }).add([
                gsap.to(main.querySelector(".section-hero2-intro-light"), {
                    opacity: 1
                }),
                // gsap.to(main.querySelector(".section-hero2-intro-bg"), {
                //     y: Viewport.isXS?"-40%":"-15%"
                // })
            ])
            .add([
                gsap.to(main.querySelector(".section-hero2-intro-light"), {
                   y:'-15%'
                }),
                gsap.to(main.querySelector(".section-hero2-intro-bg"), {
                    y: Viewport.isXS?"-40%":"-15%"
                })
            ])
            ScrollTrigger.create({
                trigger: main.querySelector('.section-hero2 .section-hero2-intro-title'),
                start: Viewport.isLG ?'60% bottom':'60% 80%',
                end: Viewport.isLG ?'60% bottom':'60% 80%',
                onEnter: () => main.querySelector('.section-hero2 .section-hero2-intro-title').classList.add('animated'),
            })
            ScrollTrigger.create({
                trigger: main.querySelector('.section-hero2 .section-hero2-intro-title'),
                start: 'top bottom',
                end: 'top bottom',
                onEnterBack: () => main.querySelector('.section-hero2 .section-hero2-intro-title').classList.remove('animated'),
            })
            
            const section = main.querySelector('.section-hero2')
            const swiperEl = section.querySelector('.swiper')
            const slides = swiperEl.querySelectorAll('.swiper-slide')
            const videoContainers = Array.from(slides, slide => slide.querySelector('.video-container'))
            const inlineVideos = videoContainers.map(container => container ? container.querySelector('.inline-video') : null)
            if(Browser.isUC || Browser.isWeChat){
                main.querySelector('.section-hero2 .section-hero2-highlights-text-container').classList.add('animated')
            }
            section.querySelector('.section-hero2-highlights-title-container video').addEventListener("ended",function(){
                main.querySelector('.section-hero2 .section-hero2-highlights-text-container').classList.add('animated')
            })
            const mySwiper = new Swiper(swiperEl, {
                init: false,
                speed: speed.slide,
                spaceBetween: U.rpx(24, 24, 0),
                noSwipingSelector: Viewport.isLG ? '.slide-content' : '.play-pause-button',
                mousewheel: {forceToAxis: true, thresholdDelta: 70},
                keyboard: true,
                parallax: true,
                resistanceRatio: 0.6,
                a11y: {enabled: false},
                slideToClickedSlide: true,
                navigation: {
                    prevEl: section.querySelector('.arrownav-prev'),
                    nextEl: section.querySelector('.arrownav-next'),
                    disabledClass: 'arrownav-disabled',
                },
                on: {
                    transitionStart: function() {
                        if (!Support.inlineVideo) return
                        const prevVideo = inlineVideos[this.previousIndex || 0]
                        if (prevVideo) prevVideo.safePause()
                        const currentVideoContainer = videoContainers[this.activeIndex]
                        if (currentVideoContainer) currentVideoContainer.classList.remove('show-start-frame')
                    },
                    transitionEnd: function() {
                        isSliderMove = false
                        swiperEl.classList.remove('swiper-touched')
                        if (!Support.inlineVideo) return
                        const prevVideo = inlineVideos[this.previousIndex]
                        if (prevVideo) prevVideo.currentTime = 0
                        const currentVideo = inlineVideos[this.activeIndex]
                        if (currentVideo && !currentVideo.classList.contains('played')) {
                            currentVideo.safeReplay()
                            if (mySwiper.autoplay.running) mySwiper.autoplay.stop()
                        }
                    },
                    slideChange: function() {
                        if (!Support.inlineVideo) return
                        const currentVideoContainer = videoContainers[this.activeIndex]
                        if (currentVideoContainer) currentVideoContainer.classList.remove('show-start-frame')
                        const prevVideoContainer = videoContainers[this.previousIndex]
                        if (prevVideoContainer) prevVideoContainer.classList.add('show-start-frame')
                    },
                    sliderMove: function() {
                        if (isSliderMove) return
                        isSliderMove = true
                        swiperEl.classList.add('swiper-touched')
                        stopAutoplayOnInteraction()
                        if (!Support.inlineVideo) return
                        const currentVideo = inlineVideos[this.activeIndex]
                        if (currentVideo) currentVideo.safePause()
                    },
                    scroll: function() {
                        stopAutoplayOnInteraction()
                    },
                    click: function() {
                        if (this.previousIndex !== this.clickedIndex) stopAutoplayOnInteraction()
                    },
                    slideChangeTransitionStart:function(){
                        this.slides.forEach(slide=>{
                            slide.querySelector('.slide-content')?.classList.remove('slide-content-show');
                        })
                    },
                    slideChangeTransitionEnd:function(){
                        const activeSlide = this.slides[this.activeIndex];
                        activeSlide.querySelector('.slide-content')?.classList.add('slide-content-show');
                    },
                    init:function(){
                        const activeSlide = this.slides[this.activeIndex];
                        activeSlide.querySelector('.slide-content')?.classList.add('slide-content-show');
                    },
                    touchStart:function(){
                       if(!Viewport.isLG){
                            this.slides.forEach(slide=>{
                                slide.querySelector('.slide-content')?.classList.remove('slide-content-show');
                            })
                       }
                    },
                    touchEnd:function(){
                        if(!Viewport.isLG){
                            const activeSlide = this.slides[this.activeIndex];
                            activeSlide.querySelector('.slide-content')?.classList.add('slide-content-show');
                        }
                    }
                },
            })
            mySwiper.disable()
            ScrollTrigger.create({
                trigger: main.querySelector('.section-hero2 .swiper-wrapper'),
                start: () => (Viewport.isLG ? 'bottom bottom' : 'bottom bottom'),
                end: () => (Viewport.isLG ? 'bottom bottom' : 'bottom bottom'),
                onEnter: () => {
                    main.querySelector('.section-hero2 .section-hero2-highlights-swiper-container').classList.add('animated')
                    mySwiper.enable()
                    swiperEl.querySelectorAll(".swiper-slide video")[0].safePlay()
                }
            })
            let slideNextTimeoutID
            let autoplayTimeoutID
            let videoEndDelay = 800
            let isSliderMove = false

            function startAutoplay() {
                if (mySwiper.isInteracted) return
                slideNextTimeoutID = setTimeout(() => mySwiper.slideNext(), videoEndDelay)
                autoplayTimeoutID = setTimeout(() => !mySwiper.autoplay.running && mySwiper.autoplay.start(), videoEndDelay + speed.slide)
            }

            function stopAutoplay() {
                if (!mySwiper.isInteracted) return
                clearTimeout(slideNextTimeoutID)
                clearTimeout(autoplayTimeoutID)
            }

            function stopAutoplayOnInteraction() {
                if (mySwiper.isInteracted) return
                mySwiper.isInteracted = true
                stopAutoplay()
            }

            slides.forEach((slide, index) => {
                const slideContent = slide.querySelector('.slide-content')
                if (!Support.inlineVideo) return
                const slideVideo = inlineVideos[index]
                if (!slideVideo) return
                if(index+1 < slides.length){
                    slideVideo.addEventListener('ended', startAutoplay, {once: true})
                }
                slideVideo.addEventListener('pause', stopAutoplay, {once: true})
            })

            mySwiper.init()
        },
        lightShadow() {
            const section = main.querySelector('.section-light-shadow')
            const swiperList = section.querySelector('.swiper-list')
            const swiperEls = section.querySelectorAll('.swiper')
            const slides = Viewport.isXS?swiperEls[1].querySelectorAll('.xs-slide'):swiperEls[1].querySelectorAll('.swiper-slide')
            const videoContainers = Array.from(slides, slide => slide.querySelector('.video-container'))
            const inlineVideos = videoContainers.map(container => container ? container.querySelector('.inline-video') : null)
            const prev = section.querySelector('.arrownav-prev')
            const next = section.querySelector('.arrownav-next')

            const swiperCenter = new Swiper(swiperEls[1], {
                speed: speed.slide,
                loop: !Viewport.isXS,
                spaceBetween: U.rpx(24, 24, 0),
                initialSlide: !Viewport.isXS ? 1 : 0,
                loopAdditionalSlides: !Viewport.isXS ? 1 : 0,
                mousewheel: {forceToAxis: true, thresholdDelta: 70},
                slideToClickedSlide: false,
                watchSlidesProgress: true,
                a11y: {enabled: false},
                navigation: {
                    prevEl: prev,
                    nextEl: next,
                    disabledClass: 'arrownav-disabled'
                },
                on: {
                    transitionStart: function() {
                        if (!Support.inlineVideo) return
                        if (!section.classList.contains('active')) return
                        const prevVideo = inlineVideos[this.previousRealIndex || 0]
                        if (prevVideo) prevVideo.safePause()
                        const currentVideoContainer = videoContainers[this.realIndex]
                        if (currentVideoContainer) currentVideoContainer.classList.remove('show-start-frame')
                        const prevVideoContainer = videoContainers[this.previousRealIndex]
                        if (prevVideoContainer) prevVideoContainer.classList.add('show-start-frame')
                    },
                    transitionEnd: function() {
                        swiperEls[1].classList.remove('swiper-touched')
                        if (!Support.inlineVideo) return
                        if (!section.classList.contains('active')) return
                        const prevVideo = inlineVideos[this.previousRealIndex]
                        if (prevVideo) prevVideo.currentTime = 0
                        const currentVideoContainer = videoContainers[this.realIndex]
                        if (currentVideoContainer) currentVideoContainer.classList.remove('show-start-frame')
                        const currentVideo = inlineVideos[this.realIndex]
                        if (currentVideo) {
                            currentVideo.safeReplay()
                        }
                    },
                    slideChange: function() {
                        // const currentVideoContainer = videoContainers[this.realIndex]
                        // if (currentVideoContainer && currentVideoContainer.classList.contains('show-start-frame')) currentVideoContainer.classList.remove('show-start-frame')
                        // const currentVideo = inlineVideos[this.realIndex]
                        // if (currentVideo && currentVideo.paused) {
                        //     currentVideo.safeReplay()
                        // }
                    },
                    sliderMove: function() {
                        swiperEls[1].classList.add('swiper-touched')
                        if (!Support.inlineVideo) return
                        if (!section.classList.contains('active')) return
                        const currentVideo = inlineVideos[this.realIndex]
                        if (currentVideo) currentVideo.safePause()
                        const currentVideoContainer = videoContainers[this.realIndex]
                        if (currentVideoContainer) currentVideoContainer.classList.add('show-start-frame')
                    },
                }
            })

            if (!Viewport.isXS) {
                const swiperConfig = {
                    speed: speed.slide,
                    initialSlide: 1,
                    loop: true,
                    loopAdditionalSlides: 1,
                    watchSlidesProgress: true,
                }

                const swiperLeft = new Swiper(swiperEls[0], {
                    ...swiperConfig,
                    spaceBetween: U.rpx(24, 24, 32),
                })

                const swiperRight = new Swiper(swiperEls[2], {
                    ...swiperConfig,
                    spaceBetween: U.rpx(24, 24, 32),
                })

                swiperCenter.controller.control = [swiperLeft, swiperRight]

                const handleSwiperTouch = (swiper1, swiper2, swiper3) => {
                    [swiper1, swiper2, swiper3].forEach(swiper => {
                        swiper.controller.control = null
                        swiper.navigation.destroy()
                    })

                    swiper1.controller.control = [swiper2, swiper3]
                    swiper1.params.navigation.prevEl = prev
                    swiper1.params.navigation.nextEl = next
                    swiper1.navigation.init()
                    swiper1.navigation.update()
                }

                swiperLeft.on('touchStart', () => handleSwiperTouch(swiperLeft, swiperCenter, swiperRight))
                swiperCenter.on('touchStart', () => {
                    swiperList.classList.add('swiper-touch-move')
                    handleSwiperTouch(swiperCenter, swiperLeft, swiperRight)
                })
                swiperRight.on('touchStart', () => handleSwiperTouch(swiperRight, swiperLeft, swiperCenter))

                swiperCenter.on('transitionEnd', () => swiperList.classList.remove('swiper-touch-move'))

                swiperLeft.on('touchMove', () => swiperList.classList.add('swiper-touch-move'))
                swiperCenter.on('touchMove', () => swiperList.classList.add('swiper-touch-move'))
                swiperRight.on('touchMove', () => swiperList.classList.add('swiper-touch-move'))
            } else {
                swiperCenter.on('transitionEnd', () => swiperList.classList.remove('swiper-touch-move'))
                swiperCenter.on('touchStart', () => swiperList.classList.add('swiper-touch-move'))
                swiperCenter.on('touchMove', () => swiperList.classList.add('swiper-touch-move'))
            }
            ScrollTrigger.create({
                trigger: swiperList,
                start: '80% bottom',
                end: '80% bottom',
                once: true,
                onEnter: () => {
                    var _activeVideo = swiperList.querySelector('.swiper-item-center .swiper-slide-active .video-container video')
                    _activeVideo.safePlay()
                }
            })
            ScrollTrigger.create({
                trigger: swiperList,
                start: '40% bottom',
                end: '40% bottom',
                once: true,
                // markers:true,
                onEnter: () => {
                    section.classList.add('active')
                }
            })
        },
        sp3dSwiper() {
            const sections = main.querySelectorAll('.sp-swiper-section')
            if(Viewport.isXS){
                ScrollTrigger.create({
                    trigger: main.querySelector('.ux-screen-container .tabnav-section>.swiper'),
                    start: 'bottom bottom',
                    end: 'bottom bottom',
                    once: true,
                    // onEnter: () => {
                    //     main.querySelector('.ux-clock-swiper video').safePlay()
                    // }
                })
                let currentPlayingIndex = 0
                let maxPlayedIndex = 0
                let playOffset = 0
                let currentSlideIndex = 0
                let clickedSlideIndex = 0
                let isButtonInCenter = true
                let playNextTimeout = null
                let isSliderMove = false

                sections.forEach(section => {
                    const swiperEl = section.querySelector('.swiper')
                    const slides = swiperEl.querySelectorAll('.swiper-slide')
                    const videoContainers = Array.from(slides, slide => slide.querySelector('.video-container'))
                    const inlineVideos = videoContainers.map(container => container ? container.querySelector('.inline-video') : null)
                    // 判断当前swiper是否图片tab（无视频）
                    const isImageTab = inlineVideos.every(vid => vid === null);

                    const mySwiper = new Swiper(swiperEl, {
                        speed: speed.slide,
                        slidesPerView: 1,
                        spaceBetween: swiperEl.classList.contains("ux-theme-swiper")?U.rpx(24, 24, 100):U.rpx(24, 24, 64),
                        noSwipingSelector: Support.hover ? '.slide-content, .play-pause-button' : '',
                        mousewheel: {forceToAxis: true, thresholdDelta: 70},
                        watchSlidesProgress: true,
                        resistanceRatio: 0.6,
                        a11y: {enabled: false},
                        on: {
                            init: function() {

                            },
                            transitionStart: function() {
                                currentSlideIndex = this.activeIndex
                                // 图片tab直接跳过视频逻辑
                                if(isImageTab || !Support.inlineVideo) return;
                                
                                clearTimeout(playNextTimeout)
                                const prevVideo = inlineVideos[this.previousIndex + playOffset]
                                const playingVideo = inlineVideos[currentPlayingIndex]
                                if (prevVideo) {
                                    prevVideo.safePause()
                                }
                                if (playingVideo) playingVideo.safePause()
                            },
                            transitionEnd: function() {
                                isSliderMove = false
                                swiperEl.classList.remove('swiper-touched')
                                // 图片tab直接退出，不执行视频逻辑
                                if(isImageTab || !Support.inlineVideo) return;
                                
                                if (!isButtonInCenter) {
                                    const activeVideo = inlineVideos[this.activeIndex]
                                    if (activeVideo.ended) activeVideo.currentTime = 0
                                    activeVideo.safePlay()
                                    isButtonInCenter = true
                                }
                                if (this.activeIndex < maxPlayedIndex) return
                                currentPlayingIndex = this.activeIndex + playOffset
                                const currentVideo = inlineVideos[currentPlayingIndex]
                                if (currentVideo && !currentVideo.classList.contains('played')) {
                                    currentVideo.safePlay()
                                }
                            },
                            sliderMove: function() {
                                main.querySelector(".ux-screen-mob-tips").classList.add("hidden-tips")
                                swiperEl.classList.add('swiper-touched')

                                if(isImageTab || !Support.inlineVideo || isSliderMove) return;

                                isSliderMove = true
                                playOffset = 0
                                const playingVideo = inlineVideos[currentPlayingIndex]
                                if (playingVideo) playingVideo.safePause()
                            },
                        },
                    })
                })


                main.querySelectorAll(".ux-screen-container .tabnav-item").forEach(function(tabNav,index){
                    tabNav.addEventListener("click",function(e){
                        var swiperIndex = 0
                        const allSwipers = main.querySelectorAll(".sp-swiper-section .swiper");
                        allSwipers.forEach(function(_swiper,index){
                            if(_swiper.classList.contains("current")){
                                swiperIndex = index
                            }
                        })
                        const _el = e.currentTarget;
                        const _parent = _el.parentElement;
                        const _index = Array.from(_parent.children).indexOf(_el);
                        if(swiperIndex != _index){
                            const oldSwiper = allSwipers[swiperIndex];

                            const oldVideo = oldSwiper.querySelector('.swiper-slide-active video');
                            if(oldVideo) oldVideo.safePause();

                            oldSwiper.classList.remove("current")

                            setTimeout(function(){
                                const newSwiper = allSwipers[_index];
                                newSwiper.classList.add("current");
                                // 仅视频tab播放视频；图片tab跳过
                                const newVideo = newSwiper.querySelector('.swiper-slide-active video');
                                if(newVideo) newVideo.safePlay();
                            },300)
                        }
                    })
                })
            }else{
               ScrollTrigger.create({
                    trigger: main.querySelector('.ux-screen-cover-container'),
                    start: '40% 60%',
                    end: '40% 60%',
                    once: true,
                    onEnter: () => {
                        const coverVideo = main.querySelector('.ux-screen-cover-container video');
                        coverVideo.addEventListener("ended",function(){
                            main.querySelector('.section-ux-screen').classList.add("animated")

                            const allSwipers = main.querySelectorAll(".sp-swiper-section .swiper");
                            allSwipers[0].resetAutoTimer();

                        },{once:true})
                        coverVideo.safePlay()
                    }
                })

                sections.forEach(section => {
                    const swiperEl = section.querySelector('.swiper')
                    const slides = swiperEl.querySelectorAll('.swiper-slide')
                    const videoContainers = Array.from(slides, slide => slide.querySelector('.video-container'))
                    const inlineVideos = videoContainers.map(container => container ? container.querySelector('.inline-video') : null)
                    const count = slides.length;
                    
                    var timer = 0
                    swiperEl.nextTimer = null;
                    const isImageTab = inlineVideos.every(vid => vid === null);

                    function reorderByIndex(index) {
                        slides.forEach((s, i) => {

                            if(!s.querySelector(".slide-media")){
                                s.querySelector("video").safePause()
                                s.dataset.id = (i - index + 1 + count) % count;
                                if((i - index + 1 + count) % count == 1){
                                    if(timer){
                                        clearTimeout(timer)
                                    }
                                    timer = setTimeout(function(){
                                        if(swiperEl.classList.contains("current")){
                                            s.querySelector("video").safePlay()
                                        }
                                    },900)
                                }
                            }else{
                                s.dataset.id = (i - index + 1 + count) % count;
                                if((i - index + 1 + count) % count == 1){
                                    if(timer){
                                        clearTimeout(timer)
                                    }
                                    timer = setTimeout(function(){
                                    },900)
                                }
                            }
                        });
                        swiperEl.resetAutoTimer();
                    }

                    slides.forEach((slide, index) => {
                        slide.addEventListener("click", () => {
                            if(swiperEl.nextTimer){
                                clearTimeout(swiperEl.nextTimer)
                            }
                            reorderByIndex(index)
                        });
                    });

                    function slideNext() {
                        const list = [...slides];
                        const target = list.find(s => s.dataset.id === "2");
                        if (target){
                            reorderByIndex(list.indexOf(target));
                        }
                    }

                    swiperEl.resetAutoTimer = function(){
                        if(swiperEl.nextTimer) clearTimeout(swiperEl.nextTimer);
                        if(!swiperEl.classList.contains("current")) return;

                        if(isImageTab){
                            // 固定等待2秒后切换第一张
                            swiperEl.nextTimer = setTimeout(()=>{
                                slideNext();
                            }, 2000)
                        }
                    }

                    if(!isImageTab){
                        inlineVideos.forEach((inlineVideo) => {
                            if(!inlineVideo) return;
                            inlineVideo.addEventListener("ended", () => {
                                if(swiperEl.nextTimer) clearTimeout(swiperEl.nextTimer);
                                swiperEl.nextTimer = setTimeout(function(){
                                    if(swiperEl.classList.contains("current")){
                                        slideNext()
                                    }
                                },2000);
                            });
                        });
                    }
                })


                main.querySelectorAll(".ux-screen-container .tabnav-item").forEach(function(tabNav,index){
                    tabNav.addEventListener("click",function(e){
                        var swiperIndex = 0
                        const allSwipers = main.querySelectorAll(".sp-swiper-section .swiper");
                        allSwipers.forEach(function(_swiper,index){
                            if(_swiper.classList.contains("current")){
                                swiperIndex = index
                            }
                        })
                        const _el = e.currentTarget;
                        const _parent = _el.parentElement;
                        const _index = Array.from(_parent.children).indexOf(_el);
                        if(swiperIndex != _index){
                            const oldSwiper = allSwipers[swiperIndex];
                            if(oldSwiper.nextTimer){
                                clearTimeout(oldSwiper.nextTimer);
                            }
                            oldSwiper.querySelector('.sp-3d-swiper-slide[data-id="1"] video')?.safePause()
                            oldSwiper.classList.remove("current")

                            setTimeout(function(){
                                const newSwiper = allSwipers[_index];
                                newSwiper.classList.add("current");
                                newSwiper.resetAutoTimer();

                                const firstVideo = newSwiper.querySelector('.sp-3d-swiper-slide[data-id="1"] video');
                                if(firstVideo) firstVideo.safePlay();

                            },300)
                        }
                    })
                })
            }
        },
        sectionMoveTop(){
            const section = main.querySelector('.section-photo-master')
            if(!window.matchMedia('(max-aspect-ratio: 14/10)').matches){
                gsap.timeline({
                    scrollTrigger: {
                        trigger: section,
                        start: 'bottom 90%',
                        end: 'bottom top',
                        scrub: 0,
                        invalidateOnRefresh: true,
                    },
                }).fromTo(section.querySelector('.section-multi-view'), {
                    rotateX: 0,
                    opacity: 1,
                }, {
                    rotateX: "-60deg",
                    opacity: 0,
                })

                gsap.timeline({
                    scrollTrigger: {
                        trigger: section,
                        start: 'bottom bottom',
                        end: 'bottom 10%',
                        scrub: 0,
                        invalidateOnRefresh: true,
                    },
                }).fromTo(main.querySelector('.xiaoyi-background-container'), {
                    z: 0,
                    rotateX: "90deg"
                }, {
                    z: 0,
                    rotateX: 0,
                },.13)
                // main.querySelectorAll('#hmos .new-xiaoyi .text-content h3 span').forEach(function(subTitle){
                //     gsap.timeline({
                //         scrollTrigger: {
                //             trigger: section,
                //             start: 'bottom bottom',
                //             end: 'bottom 10%',
                //             scrub: 0,
                //             invalidateOnRefresh: true,
                //         },
                //     }).fromTo(subTitle, {
                //         'background-position': '50% 0%'
                //     }, {
                //         'background-position': '50% 77%'
                //     })
                // })
                
            }

            ScrollTrigger.create({
                trigger: section,
                start: '40% bottom',
                end: '40% bottom',
                onEnter: () => {
                    section.classList.add('active')
                }
            })
        },
        xiaoyiIntro(){
            const section = main.querySelector('.xiaoyi-intro')
            const _content = section.querySelector('.new-xiaoyi .text-content')
            ScrollTrigger.create({
                trigger: _content,
                start: Viewport.isXS?'top 50%':'80% bottom',
                end: Viewport.isXS?'top 50%':'80% bottom',
                onEnter: () => {
                    _content.classList.add('animated')
                }
            })
            ScrollTrigger.create({
                trigger: _content,
                start: 'top bottom',
                end: 'top bottom',
                onEnterBack: () => _content.classList.remove('animated'),
            })
            gsap.timeline({
                scrollTrigger: {
                    trigger: main.querySelector(".new-xiaoyi .new-xiaoyi-swiper .swiper"),
                    start: "10% bottom",
                    end: "bottom bottom",
                    scrub: 0.2,
                    invalidateOnRefresh: true,
                },
            }).to(main.querySelector(".new-xiaoyi .new-xiaoyi-content"),1, {
                scale: 1,
                borderRadius: 0
            })
        },
        performanceIntro(){
            gsap.timeline({
                scrollTrigger: {
                    trigger: main.querySelector(".performance-intro-bg-container"),
                    start: "top bottom",
                    end: "bottom bottom",
                    scrub: 0.2,
                    invalidateOnRefresh: true,
                },
            }).to(main.querySelector(".performance-intro-bg-container .performance-intro-bg"),1, {
                y:0
            })
            ScrollTrigger.create({
                trigger: main.querySelector('.performance-intro-animation-container'),
                start: 'bottom bottom',
                end: 'bottom bottom',
                onEnter: () => main.querySelector('.performance-intro').classList.add('animated'),
            })
            ScrollTrigger.create({
                trigger: main.querySelector('.performance-intro-animation-container'),
                start: 'top bottom',
                end: 'top bottom',
                onEnterBack: () => main.querySelector('.performance-intro').classList.remove('animated'),
            })
        },
        performanceMode(){
            const _video = main.querySelector('.performance-mode-media video')
            const _container = main.querySelector('.performance-mode-detail-container')
            if(Browser.isUC || Browser.isWeChat){
                _container.classList.add("animated")
            }
            _video.addEventListener("timeupdate",function(){
                if (_video.currentTime >= 1) {
                    _container.classList.add("animated")
                }
            })
            ScrollTrigger.create({
                trigger: _video,
                start: '50% bottom',
                end: '50% bottom',
                onEnter: () => {
                    _video.safePlay()
                }
            })
            ScrollTrigger.create({
                trigger: _video,
                start: 'top bottom',
                end: 'top bottom',
                onEnterBack: () => _container.classList.remove('animated'),
            })
        },
        performanceSpace(){
            const section = main.querySelector('.performance-space')
            const _swiper = section.querySelector('.performance-space-content .swiper')
            const _detail = section.querySelector('.performance-space-detail-container')
            ScrollTrigger.create({
                trigger: _swiper,
                start: '90% bottom',
                end: '90% top',
                onEnter: () => {
                    _detail.classList.add('animated')
                },
                onLeave: () => {
                    _detail.classList.remove('animated')
                },
            })
            ScrollTrigger.create({
                trigger: _swiper,
                start: '-10% bottom',
                end: '-10% top',
                onEnterBack: () => {
                    _detail.classList.add('animated')
                },
                onLeaveBack: () => {
                    _detail.classList.remove('animated')
                },
            })
        },
        performanceAi(){
            const section = main.querySelector('.performance-ai-content')

            const swiperEl = section.querySelector('.swiper')
            let isFadeSwiper = false
            if(swiperEl.classList.contains('fade-swiper') && !Viewport.isLG)isFadeSwiper = true
            const isInSwiper = swiperEl.classList.contains('swiper-click-inside')
            const slides = swiperEl.querySelectorAll('.swiper-slide')
            const videoContainers = Array.from(slides, slide => slide.querySelector('.video-container'))
            const inlineVideos = videoContainers.map(container => container ? container.querySelector('.inline-video') : null)

            let currentPlayingIndex = 0
            let maxPlayedIndex = 0
            let playOffset = 0
            let currentSlideIndex = 0
            let clickedSlideIndex = 0
            let isButtonInCenter = true
            let playNextTimeout = null
            let isSliderMove = false

            const mySwiper = new Swiper(swiperEl, {
                effect: isFadeSwiper?"fade":"slide",
                fadeEffect: {crossFade: true},
                speed: speed.slide,
                slideToClickedSlide: true,
                slidesPerView: 'auto',
                spaceBetween: isFadeSwiper?0:U.rpx(24, 24, 32),
                parallax: Viewport.isXS,
                noSwipingSelector: Support.hover ? '.slide-content, .play-pause-button' : '',
                mousewheel: {forceToAxis: true, thresholdDelta: 70},
                watchSlidesProgress: true,
                resistanceRatio: 0.6,
                a11y: {enabled: false},
                navigation: {
                    prevEl: section.querySelector('.arrownav-prev'),
                    nextEl: section.querySelector('.arrownav-next'),
                    disabledClass: 'arrownav-disabled',
                },
                on: {
                    init: function() {
                        if (Viewport.isXS || !Support.inlineVideo) return
                        const firstVideo = inlineVideos[0]
                    },
                    slideChange: function(swiper){
                        if(Support.inlineVideo){
                            var _slide = swiper.slides[swiper.activeIndex];
                            $(swiper.slides).find("video").each(function(){
                                $(this)[0].safePause()
                            })
                            if($(_slide).find('video').length == 1){
                                var _video = $(_slide).find('video')[0]
                                _video.safePlay()
                            }else if($(_slide).find('video').length > 1){
                                var _video = $(_slide).find('.swiper-slide-active video')[0]
                                _video.safePlay()
                            }
                        }
                    },
                },
            })
        },
        safetyIntro(){
            const _video = main.querySelector('.safety-intro video')
            const _container = main.querySelector('.section-safety')
            if (Browser.isUC || Browser.isWeChat) {
                _container.classList.add("animated")
            }
            _video.addEventListener("timeupdate",function(){
                if (_video.currentTime >= 1.75) {
                    _container.classList.add("animated")
                }
            })
            ScrollTrigger.create({
                trigger: _video,
                start: '50% bottom',
                end: '50% bottom',
                once: true,
                onEnter: () => {
                    _video.safePlay()
                }
            })
        },
        safetyAi(){
            const _container = main.querySelector('.safety-ai-row')
            ScrollTrigger.create({
                trigger: _container,
                start: '80% bottom',
                end: '80% bottom',
                onEnter: () => {
                    _container.classList.add('animated')
                }
            })
            ScrollTrigger.create({
                trigger: _container,
                start: 'top bottom',
                end: 'top bottom',
                onEnterBack: () => _container.classList.remove('animated'),
            })
        },
        connectIntro(){
            const _container = main.querySelector('.connect-intro-container')
            new SequenceFrame(_container, {
                cover: false,
                onUpdate(self, frame) {
                },
                onStart(self) {
                    var isPlaying = false
                    ScrollTrigger.create({
                        trigger: self.elements.container,
                        start: () => (Viewport.isLG ? 'bottom bottom' : 'bottom bottom'),
                        end: () => (Viewport.isLG ? 'bottom bottom' : 'bottom bottom'),
                        scrub: 0,
                        once: true,
                        onEnter: () => {
                            if(!isPlaying){
                                isPlaying = true
                                setTimeout(function(){
                                    isPlaying = false
                                },1300)
                                _container.classList.add('animated')
                                self.currentFrame = 0
                                self.lastDrawnFrameIndex = -1
                                self.targetFrame = self.lastFrameIndex
                                self.renderFramesAuto(1300)
                            }
                            
                        }
                    })
                }
            })
            
        },
        loveMore(){
            gsap.timeline({
                scrollTrigger: {
                    trigger: main.querySelector(".love-more .love-more-container"),
                    start: "10% bottom",
                    end: "bottom bottom",
                    scrub: 0.2,
                    invalidateOnRefresh: true,
                },
            }).to(main.querySelector(".love-more .tabnav-section"),1, {
                scale: 1,
                borderRadius: 0
            })
            
        },
        carouselSwipers() {
            const sections = main.querySelectorAll('.section-carousel')

            sections.forEach(section => {
                const swiperEl = section.querySelector('.swiper')
                let isFadeSwiper = false
                if(swiperEl.classList.contains('fade-swiper') && !Viewport.isLG)isFadeSwiper = true
                const isInSwiper = swiperEl.classList.contains('swiper-click-inside')
                const slides = swiperEl.querySelectorAll('.swiper-slide')
                const videoContainers = Array.from(slides, slide => slide.querySelector('.video-container'))
                const inlineVideos = videoContainers.map(container => container ? container.querySelector('.inline-video') : null)

                let currentPlayingIndex = 0
                let maxPlayedIndex = 0
                let playOffset = 0
                let currentSlideIndex = 0
                let clickedSlideIndex = 0
                let isButtonInCenter = true
                let playNextTimeout = null
                let isSliderMove = false

                const playNextVideo = () => {
                    const perView = mySwiper.slidesPerViewDynamic()
                    if (perView < 2) return
                    const maxVisibleIndex = mySwiper.activeIndex + perView - 1
                    const nextIndex = currentPlayingIndex + 1
                    if (nextIndex > maxVisibleIndex) return
                    const nextVideo = inlineVideos[nextIndex]
                    const isPlayed = nextVideo && nextVideo.classList.contains('played')
                    if (isPlayed || !nextVideo) return
                    playNextTimeout = setTimeout(() => {
                        nextVideo.safePlay()
                        currentPlayingIndex = nextIndex
                        playOffset = 1
                        nextVideo.addEventListener('ended', playNextVideo, {once: true})
                    }, 800)
                }

                const mySwiper = new Swiper(swiperEl, {
                    effect: isFadeSwiper?"fade":"slide",
                    fadeEffect: {crossFade: true},
                    speed: speed.slide,
                    slidesPerView: 'auto',
                    spaceBetween: isFadeSwiper?0:U.rpx(24, 24, 32),
                    parallax: Viewport.isXS,
                    noSwipingSelector: Support.hover ? '.slide-content, .play-pause-button' : '',
                    mousewheel: {forceToAxis: true, thresholdDelta: 70},
                    watchSlidesProgress: true,
                    resistanceRatio: 0.6,
                    a11y: {enabled: false},
                    navigation: {
                        prevEl: section.querySelector('.arrownav-prev'),
                        nextEl: section.querySelector('.arrownav-next'),
                        disabledClass: 'arrownav-disabled',
                    },
                    on: {
                        init: function() {
                            if (Viewport.isXS || !Support.inlineVideo) return
                            const firstVideo = inlineVideos[0]
                            if (firstVideo) firstVideo.addEventListener('ended', playNextVideo, {once: true})
                        },
                        transitionStart: function() {
                            currentSlideIndex = this.activeIndex
                            if (!Support.inlineVideo) return
                            clearTimeout(playNextTimeout)
                            const prevVideo = inlineVideos[this.previousIndex + playOffset]
                            const playingVideo = inlineVideos[currentPlayingIndex]
                            if (prevVideo) {
                                prevVideo.safePause()
                                prevVideo.removeEventListener('ended', playNextVideo)
                            }
                            if (playingVideo) playingVideo.safePause()
                        },
                        transitionEnd: function() {
                            isSliderMove = false
                            swiperEl.classList.remove('swiper-touched')
                            if (!Support.inlineVideo) return
                            if (!isButtonInCenter) {
                                const activeVideo = inlineVideos[this.activeIndex]
                                if (activeVideo.ended) activeVideo.currentTime = 0
                                activeVideo.safePlay()
                                isButtonInCenter = true
                            }
                            if (this.activeIndex < maxPlayedIndex) return
                            currentPlayingIndex = this.activeIndex + playOffset
                            const currentVideo = inlineVideos[currentPlayingIndex]
                            if (currentVideo && !currentVideo.classList.contains('played')) {
                                currentVideo.safePlay()
                                if (!Viewport.isXS) currentVideo.addEventListener('ended', playNextVideo, {once: true})
                            }
                        },
                        sliderMove: function() {
                            swiperEl.classList.add('swiper-touched')
                            if (!Support.inlineVideo || isSliderMove) return
                            isSliderMove = true
                            playOffset = 0
                            const playingVideo = inlineVideos[currentPlayingIndex]
                            if (playingVideo) playingVideo.safePause()
                        },
                    },
                })

                swiperEl.addEventListener('click', event => {
                    const slide = event.target.closest('.swiper-slide')
                    if (!slide) return
                    const isSlideVisible = slide.classList.contains('swiper-slide-visible')
                    const isContent = event.target.closest('.slide-content') !== null
                    if (isSlideVisible || isContent) return
                    clickedSlideIndex = Array.from(slides).indexOf(slide)
                    clickedSlideIndex > currentSlideIndex ? mySwiper.slideNext() : mySwiper.slidePrev()
                    currentSlideIndex = clickedSlideIndex
                })

                videoContainers.forEach((container, index) => {
                    if (!container) return
                    const slide = slides[index]
                    const video = inlineVideos[index]
                    const playPauseButton = container.querySelector('.play-pause-button');
                    ['pause', 'ended'].forEach(event => {
                        video.addEventListener(event, () => {
                            maxPlayedIndex = Math.max(index, maxPlayedIndex)
                        })
                    })
                    playPauseButton.addEventListener('click', event => {
                        event.preventDefault()
                        isButtonInCenter = slide.classList.contains('swiper-slide-active') || slide.classList.contains('swiper-slide-next')
                        currentPlayingIndex = index
                        if (index > 0 && mySwiper.slidesPerViewDynamic() > 1) playOffset = 1
                        inlineVideos.forEach((v, i) => {
                            if (v && i !== index) {
                                v.removeEventListener('ended', playNextVideo)
                                v.safePause()
                            }
                        })
                        if (video.paused || video.ended) {
                            if (isButtonInCenter) {
                                video.ended && (video.currentTime = 0)
                                video.safePlay()
                            }
                        } else {
                            video.safePause()
                        }
                    })
                })
            })
        },
        carouselDemo03() {
            const section = main.querySelector('.section-carousel-demo-03')
            const swiper = section.querySelector('.swiper').swiper
            const stackItems = section.querySelectorAll('.stack-item')
            swiper.on('slideChange', function() {
                stackItems.forEach((item, index) => item.classList.toggle('current', index === this.activeIndex))
            })
        },
        handleSwiperTransition() {
            const swiperEls = main.querySelectorAll('.swiper')
            swiperEls.forEach(swiperEl => {
                const swiper = swiperEl.swiper
                if (!swiper) return
                swiper.on('sliderMove', () => swiperEl.classList.add('swiper-touched'))
                swiper.on('transitionEnd', () => swiperEl.classList.remove('swiper-touched'))
            })
        },
    }

    document.addEventListener('DOMContentLoaded', () => {
        Helper.init()
        InlineMedia.init()
        Page.init()

        const tabNavSections = document.querySelectorAll('.tabnav-section')
        tabNavSections.forEach(section => new TabNavSwiper(section))

        const openButtons = document.querySelectorAll('[data-modal-open]')
        openButtons.forEach(openButton => new Modal(openButton))

        const refresh = () => {
            clearTimeout(refresh.timeout)
            refresh.timeout = setTimeout(ScrollTrigger.refresh(true), 200)
        }
        window.addEventListener('resize', refresh)
        const observer = new ResizeObserver(refresh)
        observer.observe(html)
    })
})()
