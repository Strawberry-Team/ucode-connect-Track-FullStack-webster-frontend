import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Brush, Droplet, Crop, Hand, Waves, Shapes, Type, Eraser, Image } from 'lucide-react';

interface ProductLandingProps {
    toggleView: () => void;
}

const ProductLanding: React.FC<ProductLandingProps> = ({ toggleView }) => {
    const [activeFeature, setActiveFeature] = useState(0);
    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    const features = [
        {
            icon: <Brush className="w-8 h-8" />,
            title: "Brush",
            description: "Draw freehand lines with a brush.",
            preview: "https://pixlr.com/img/tool/draw-info.jpg"
        },
        {
            icon: <Eraser className="w-8 h-8" />,
            title: "Eraser",
            description: "Erase parts of elements or drawings.",
            preview: "https://pixlr.com/img/tool/eraser-info.jpg"
        },
        {
            icon: <Type className="w-8 h-8" />,
            title: "Text",
            description: "Add and edit text on the canvas.",
            preview: "https://pixlr.com/img/tool/text-info.jpg"
        },
        {
            icon: <Shapes className="w-8 h-8" />,
            title: "Shape",
            description: "Draw various shapes like rectangles, circles.",
            preview: "https://pixlr.com/img/tool/shape-info.jpg"
        },
        {
            icon: <Image className="w-8 h-8" />,
            title: "Image Transform",
            description: "Select and transform imported images.",
            preview: "/tooltips/option-tooltips/landscape.jpg"
        },
        {
            icon: <Waves className="w-8 h-8" />,
            title: "Liquify",
            description: "Distort image areas as if they were liquid.",
            preview: "https://pixlr.com/img/tool/liquify-info.jpg"
        },
        {
            icon: <Droplet className="w-8 h-8" />,
            title: "Blur",
            description: "Blur parts of the image using a brush.",
            preview: "https://pixlr.com/img/tool/detail-info.jpg"
        },
        {
            icon: <Crop className="w-8 h-8" />,
            title: "Crop",
            description: "Crop the canvas to a selected area.",
            preview: "https://pixlr.com/img/tool/crop-info.jpg"
        },
        {
            icon: <Hand className="w-8 h-8" />,
            title: "Hand",
            description: "Pan the canvas.",
            preview: "https://pixlr.com/img/tool/hand-info.jpg"
        },
    ];


    const team = [
        {
            name: "Inessa Repeshko",
            role: ["Team Lead", "Frontend Engineer"],
            avatar: "/teams/inessa.png",
            social: { github: "https://github.com/InessaRepeshko" }
        },
        {
            name: "Andrew Laskevych",
            role: ["Backend Developer", "Product Manager"],
            avatar: "/teams/andrew.png",
            social: { github: "https://github.com/laskevych" }
        },
        {
            name: "Vadym Zharyi",
            role: ["Frontend Engineer", "UI/UX Designer"],
            avatar: "/teams/vadym.png",
            social: { github: "https://github.com/vzharyi" }
        },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % features.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);


    return (
        <>
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <motion.div
                                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-400/10 to-blue-600/20 px-4 py-2 rounded-full border border-blue-500/30 mb-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                            >
                                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                <span className="text-sm text-gray-300">Simple Creative Editor</span>
                            </motion.div>
                            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Create</span><br />
                                <span className="text-white">Without Limits</span>
                            </h1>
                            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                                Create captivating visuals instantly and easily. <br/> Unleash your creativity easily - no experience required!                       
                                </p>
                            <div className="flex flex-col sm:flex-row gap-4">

                                <Button
                                    onClick={toggleView}
                                    variant="secondary"
                                    className="font-semibold text-lg rounded-full bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-full text-white font-semibold"
                                >

                                    <svg className="!w-5 !h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span>Start Creating</span>
                                </Button>

                                <Button

                                    variant="outline"
                                    className="font-semibold text-lg px-8 py-4 bg-transparent hover:bg-[#303237FF] border-2 border-[#414448FF] rounded-full text-[#A7A8AAFF] hover:text-white font-semibold"

                                >
                                    <svg className="!w-5 !h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    <span>View Demo</span>
                                </Button>
                            </div>
                        </motion.div>
                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        >
                            <div className="relative bg-gradient-to-br from-[#25282C] to-[#1F2125] rounded-3xl p-7 border border-gray-700/50 shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/15 to-blue-600/10 rounded-3xl"></div>
                                <div className="relative z-10">
                                    <img
                                        src="/canva/preview.png"
                                        alt="Editor Preview"
                                        className="w-full rounded-xl object-cover"
                                    />
                                </div>
                                <motion.div
                                    className="z-10 absolute -top-5 -right-4 bg-gradient-to-br from-blue-400 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                                    animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </motion.div>
                                <motion.div
                                    className="absolute -bottom-4 -left-4 bg-gradient-to-br from-pink-500 to-orange-500 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                                    animate={{ y: [0, 10, 0], rotate: [0, -5, 5, 0] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                >
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section id="features" className="py-20 px-6 bg-[#25282C]">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Powerful Features</span>
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Everything you need for quick creativity. Simple tools that work right away — without studying the instructions and settings.
                        </p>
                    </motion.div>

                    {/* Сетка карточек фичей */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="bg-gradient-to-br from-[#292C31] to-[#1F2125] rounded-3xl p-6 border border-gray-700/50 shadow-2xl text-center w-full hover:shadow-blue-500/10 max-w-sm "
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: index * 0.2 }}
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
                            >
                                {/* Превью изображения */}
                                <div className="relative mb-6 overflow-hidden rounded-2xl bg-gray-800/50">
                                    <img
                                        src={feature.preview}
                                        alt={feature.title}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>

                                {/* Иконка и заголовок */}
                                <div className="flex gap-4 items-start">
                                    <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                                        {feature.icon}
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <h3 className="text-xl font-bold text-white self-start">{feature.title}</h3>
                                        <p className="text-gray-300 leading-relaxed text-left">{feature.description}</p>
                                    </div>
                                </div>


                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>


            <section id="team" className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Meet the Team</span>
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Built with passion by creative minds who understand what artists and designers need.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                        {team.map((member, index) => (
                            <motion.div
                                key={index}
                                className="hover:shadow-blue-500/10 bg-gradient-to-br from-[#292C31] to-[#1F2125] rounded-3xl border border-gray-700/50 shadow-2xl text-center w-full max-w-sm cursor-pointer"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: index * 0.2 }}
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
                            >
                                <a
                                    href={member.social.github}
                                    className="block w-full h-full p-8"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <div className="mb-6 flex justify-center items-center">
                                        <div className="w-40 h-55 overflow-hidden">
                                            <img
                                                src={member.avatar}
                                                alt={member.name}
                                            />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>
                                    <div className="flex flex-col gap-1 mb-4">
                                        <span className="text-blue-400 font-semibold text-lg">{member.role[0]}</span>
                                        <span className="text-blue-400 font-semibold text-lg">{member.role[1]}</span>
                                    </div>
                                </a>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 bg-[#25282C]">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl lg:text-6xl font-bold mb-6">
                            Ready to <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Create?</span>
                        </h2>
                        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                            Join thousands of creators who have already discovered the power of our creative platform. Start your journey today - it's free to get started.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Button
                                onClick={toggleView}
                                variant="secondary"
                                className="font-semibold text-lg rounded-full bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-full text-white font-semibold"
                            >

                                <svg className="!w-6 !h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                <span>Start Creating Now</span>
                            </Button>


                        </div>
                    </motion.div>
                </div>
            </section>

            <footer className="py-12 px-6 bg-[#1F2125] border-t border-gray-700/50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center space-x-3 mb-6 md:mb-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                                Flowy
                            </span>
                        </div>
                        <div className="flex items-center space-x-6">
                            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Privacy</a>
                            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Terms</a>
                            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Support</a>
                            <div className="flex space-x-4">
                                <motion.a href="#" className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.66-.22.66-.49v-1.7c-2.78.61-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03A9.564 9.564 0 0112 6.8c.85.004 1.71.11 2.52.33 1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.56.94.56 1.92v2.84c0 .27.16.58.67.49A10.01 10.01 0 0022 12c0-5.52-4.48-10-10-10z" /></svg>
                                </motion.a>
                                <motion.a href="#" className="w-10 h-10 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg>
                                </motion.a>
                                <motion.a href="#" className="w-10 h-10 bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </motion.a>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-700/50 text-center text-gray-400">
                        <p>© 2025 Flowy. Made with ❤️ for creators everywhere.</p>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default ProductLanding;