import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Brush, Droplet, Crop, Hand, Waves, Shapes, Type, Eraser, Image, Blend, CirclePlay, CirclePlus, Plus, Play, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {  User } from 'lucide-react';
import { Shield, FileText, Lock, Users, Database, Eye, CheckCircle, AlertCircle, Info } from 'lucide-react';


interface ProductLandingProps {
    toggleView: () => void;
}

const ProductLanding: React.FC<ProductLandingProps> = ({ toggleView }) => {
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

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

    const PrivacyDialog = () => (
        <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
            <DialogContent className="bg-gradient-to-br from-[#1a1d21] via-[#25282c] to-[#2a2d31] max-w-5xl max-h-[85vh] overflow-y-auto custom-scroll p-0 border-none shadow-2xl">
                {/* Header with gradient background */}
                <div className="relative bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 p-8 text-center overflow-hidden">
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-600/20"
                        animate={{
                            background: [
                                "linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))",
                                "linear-gradient(45deg, rgba(147, 51, 234, 0.2), rgba(59, 130, 246, 0.2))"
                            ]
                        }}
                        transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
                    />
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative z-10"
                    >
                        <Shield className="w-16 h-16 text-white mx-auto mb-4" />
                        <DialogTitle className="text-4xl font-bold text-white mb-2">Privacy Policy</DialogTitle>
                        <DialogDescription className="text-blue-100 text-lg">
                            <strong>Effective Date: June 2025</strong>
                        </DialogDescription>
                    </motion.div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                    {/* Information We Collect Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-[#2a2d31] to-[#1f2226] rounded-2xl p-6 border border-gray-700/50"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                                <Database className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Information We Collect</h3>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-5 rounded-xl border border-blue-500/20">
                                <div className="flex items-center gap-2 mb-3">
                                    <Users className="w-5 h-5 text-blue-400" />
                                    <h4 className="font-semibold text-blue-300 text-lg">Account Information</h4>
                                </div>
                                <ul className="text-gray-300 space-y-2">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                                        <span>Email address and password for account creation</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                                        <span>Profile information you choose to provide</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                                        <span>Authentication tokens for secure access</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-5 rounded-xl border border-purple-500/20">
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText className="w-5 h-5 text-purple-400" />
                                    <h4 className="font-semibold text-purple-300 text-lg">Project Data</h4>
                                </div>
                                <ul className="text-gray-300 space-y-2">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                                        <span>Images and graphics you upload or create</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                                        <span>Project files, layers, and editing history</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                                        <span>Canvas data and tool settings</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-5 rounded-xl border border-emerald-500/20">
                                <div className="flex items-center gap-2 mb-3">
                                    <Eye className="w-5 h-5 text-emerald-400" />
                                    <h4 className="font-semibold text-emerald-300 text-lg">Usage Information</h4>
                                </div>
                                <ul className="text-gray-300 space-y-2">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                                        <span>Tool usage patterns and preferences</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                                        <span>Canvas interactions and drawing data</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                                        <span>Performance metrics and error logs</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>

                    {/* How We Use Your Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-[#2a2d31] to-[#1f2226] rounded-2xl p-6 border border-gray-700/50"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                                <Info className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">How We Use Your Information</h3>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {[
                                "Provide and maintain the Flowy editing platform",
                                "Save and sync your projects across devices",
                                "Improve our tools and user experience",
                                "Send important service updates",
                                "Provide customer support"
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 rounded-lg border border-emerald-500/20"
                                >
                                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                    <span className="text-gray-300">{item}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Data Storage and Security */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-br from-[#2a2d31] to-[#1f2226] rounded-2xl p-6 border border-gray-700/50"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                                <Lock className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Data Storage and Security</h3>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {[
                                "All project data is stored securely with encryption",
                                "We implement industry-standard security measures",
                                "Your creative work remains private and confidential",
                                "We do not access your projects without permission"
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-500/10 to-red-600/5 rounded-lg border border-red-500/20"
                                >
                                    <Shield className="w-5 h-5 text-red-400 flex-shrink-0" />
                                    <span className="text-gray-300">{item}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Data Sharing and Your Rights - Combined */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-gradient-to-br from-[#2a2d31] to-[#1f2226] rounded-2xl p-6 border border-gray-700/50"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Data Sharing</h3>
                            </div>
                            <p className="text-gray-300 mb-4">We do not sell, trade, or share your personal information or creative work with third parties, except:</p>
                            <div className="space-y-2">
                                {["When required by law", "To protect our rights or safety", "With your explicit consent"].map((item, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm text-gray-400">
                                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-gradient-to-br from-[#2a2d31] to-[#1f2226] rounded-2xl p-6 border border-gray-700/50"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Your Rights</h3>
                            </div>
                            <div className="space-y-3">
                                {[
                                    "Access and download your project data",
                                    "Delete your account and associated data",
                                    "Modify your profile information",
                                    "Control project sharing settings"
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center gap-3 p-2 bg-cyan-500/10 rounded-lg">
                                        <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                                        <span className="text-gray-300 text-sm">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );

    const TermsDialog = () => (
        <Dialog open={showTerms} onOpenChange={setShowTerms}>
            <DialogContent className="bg-gradient-to-br from-[#1a1d21] via-[#25282c] to-[#2a2d31] max-w-5xl max-h-[85vh] overflow-y-auto custom-scroll p-0 border-none shadow-2xl">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 p-8 text-center overflow-hidden">
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-indigo-600/20"
                        animate={{
                            background: [
                                "linear-gradient(45deg, rgba(147, 51, 234, 0.2), rgba(79, 70, 229, 0.2))",
                                "linear-gradient(45deg, rgba(79, 70, 229, 0.2), rgba(147, 51, 234, 0.2))"
                            ]
                        }}
                        transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
                    />
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative z-10"
                    >
                        <FileText className="w-16 h-16 text-white mx-auto mb-4" />
                        <DialogTitle className="text-4xl font-bold text-white mb-2">Terms of Service</DialogTitle>
                        <DialogDescription className="text-purple-100 text-lg">
                            <strong>Effective Date: June 2025</strong>
                        </DialogDescription>
                    </motion.div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                    {/* Acceptance and Service Description */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-[#2a2d31] to-[#1f2226] rounded-2xl p-6 border border-gray-700/50"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Acceptance of Terms</h3>
                            </div>
                            <p className="text-gray-300">By using Flowy, you agree to these Terms of Service and our Privacy Policy.</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gradient-to-br from-[#2a2d31] to-[#1f2226] rounded-2xl p-6 border border-gray-700/50"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                                    <Info className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Service Description</h3>
                            </div>
                            <p className="text-gray-300 mb-3">Flowy is a web-based graphic design platform providing:</p>
                            <div className="space-y-1">
                                {["Canvas-based drawing tools", "Layer management", "Image transformation", "Project saving"].map((item, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm text-gray-400">
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* User Accounts and Acceptable Use */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-br from-[#2a2d31] to-[#1f2226] rounded-2xl p-6 border border-gray-700/50"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">User Accounts & Acceptable Use</h3>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="font-semibold text-green-400 text-lg flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Account Requirements
                                </h4>
                                <div className="space-y-3">
                                    {[
                                        "Provide accurate registration information",
                                        "Maintain account security",
                                        "One account per person",
                                        "Must be 13+ years old"
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg">
                                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-300 text-sm">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-semibold text-red-400 text-lg flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Prohibited Activities
                                </h4>
                                <div className="space-y-3">
                                    {[
                                        "Upload copyrighted material without permission",
                                        "Create offensive or illegal content",
                                        "Attempt to hack or disrupt service",
                                        "Share account credentials"
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg">
                                            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-300 text-sm">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Additional Sections in Grid */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-gradient-to-br from-[#2a2d31] to-[#1f2226] rounded-2xl p-6 border border-gray-700/50"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Intellectual Property</h3>
                            </div>
                            <div className="space-y-2 text-sm text-gray-300">
                                <p>• You retain ownership of your creations</p>
                                <p>• Flowy retains platform rights</p>
                                <p>• Respect third-party IP rights</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-gradient-to-br from-[#2a2d31] to-[#1f2226] rounded-2xl p-6 border border-gray-700/50"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Limitation of Liability</h3>
                            </div>
                            <div className="space-y-2 text-sm text-gray-300">
                                <p>• Service provided "as is"</p>
                                <p>• Not liable for data loss</p>
                                <p>• No warranty on availability</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="bg-gradient-to-br from-[#2a2d31] to-[#1f2226] rounded-2xl p-6 border border-gray-700/50"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Termination</h3>
                            </div>
                            <div className="space-y-2 text-sm text-gray-300">
                                <p>• Delete account anytime</p>
                                <p>• We may suspend for violations</p>
                                <p>• Data deleted within 30 days</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Contact Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="bg-gradient-to-r from-blue-400/10 to-purple-600/10 rounded-2xl p-6 border border-blue-500/30 text-center"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">Need Help?</h3>
                        <p className="text-gray-300 mb-4">
                            For questions about these Terms or Privacy Policy, contact us at:
                        </p>
                        <Button
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-lg"
                            onClick={() => window.open("https://mail.google.com/mail/?view=cm&fs=1&to=support@flowy.com", "_blank")}
                        >
                            support@flowy.com
                        </Button>
                    </motion.div>
                </div>
            </DialogContent>
        </Dialog>
    );

    interface CustomDropdownProps {
        trigger: React.ReactNode;
        children: React.ReactNode;
    }

    const CustomDropdown: React.FC<CustomDropdownProps> = ({ trigger, children }) => {
        const [isOpen, setIsOpen] = useState(false);
        const dropdownRef = useRef<HTMLDivElement>(null);

        const handleToggle = () => {
            setIsOpen((prev) => !prev);
        };

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };

            if (isOpen) {
                document.addEventListener('mousedown', handleClickOutside);
            }

            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, [isOpen]);

        return (
            <div className="relative" ref={dropdownRef}>
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleToggle}
                    className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors outline-none cursor-pointer"
                >
                    {trigger}
                </motion.div>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 p-1 bg-[#292C31FF] border-2 border-[#44474AFF] rounded-lg text-gray-200 min-w-[100px] z-10"
                    >
                        {children}
                    </motion.div>
                )}
            </div>
        );
    };

    const team = [
        {
            name: "Inessa Repeshko",
            role: ["Team Lead", "Frontend Engineer"],
            avatar: "/teams/inessa.webp",
            social: { github: "https://github.com/InessaRepeshko" }
        },
        {
            name: "Andrew Laskevych",
            role: ["Backend Developer", "Product Manager"],
            avatar: "/teams/andrew.webp",
            social: { github: "https://github.com/laskevych" }
        },
        {
            name: "Vadym Zharyi",
            role: ["Frontend Engineer", "UI/UX Designer"],
            avatar: "/teams/vadym.webp",
            social: { github: "https://github.com/vzharyi" }
        },
    ];


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
                            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Create</span><br />
                                <span className="text-white">Without Limits</span>
                            </h1>
                            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                                Create captivating visuals instantly and easily. <br /> Unleash your creativity easily - no experience required!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">

                                <Button
                                    onClick={toggleView}
                                    variant="secondary"
                                    className="font-semibold text-lg rounded-full bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-full text-white font-semibold"
                                >
                                    <Plus className="!w-7 !h-7" />
                                    <span>Start Creating</span>
                                </Button>

                                <Button

                                    variant="outline"
                                    className="font-semibold text-lg px-8 py-4 bg-transparent hover:bg-[#303237FF] border-2 border-[#414448FF] rounded-full text-[#A7A8AAFF] hover:text-white font-semibold"

                                >
                                    <Play className="!w-7 !h-7" />
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
                                    <Brush className="w-8 h-8 text-white" />
                                </motion.div>
                                <motion.div
                                    className="absolute -bottom-4 -left-4 bg-gradient-to-br from-blue-400 to-blue-600 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                                    animate={{ y: [0, 10, 0], rotate: [0, -5, 5, 0] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                >
                                    <Image className="w-6 h-6 text-white" />
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
                            Everything you need for quick creativity. <br /> Simple tools that work without studying the instructions and settings.
                        </p>
                    </motion.div>

                    {/* Сетка карточек фичей */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
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

            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Compare Possibilities</span>
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            See what's available for everyone and what unlocks with an account
                        </p>
                    </motion.div>

                    <div className="max-w-5xl mx-auto">
                        {/* Header */}
                        <div className="grid grid-cols-3 gap-6 mb-8">
                            <div className="text-center">
                            </div>
                            <motion.div
                                className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-6 text-center border border-gray-600"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                viewport={{ once: true }}
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <User className="!h-8 !w-8" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Guest User</h3>
                                <p className="text-gray-300 text-sm">No account required</p>
                            </motion.div>
                            <motion.div
                                className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-center border border-blue-500 relative overflow-hidden"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                viewport={{ once: true }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-800/30"></div>
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-8 h-8 " />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Registered User</h3>
                                    <p className="text-blue-100 text-sm">Full access unlocked</p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Features comparison */}
                        <div className="space-y-6">
                            {/* Watermark feature */}
                            <motion.div
                                className="grid grid-cols-3 gap-6 items-center"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                viewport={{ once: true }}
                            >
                                <div className="bg-gradient-to-br from-[#292C31] to-[#1F2125] rounded-2xl p-6 border border-gray-700/50">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                                            <Image className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white">Project Export</h4>
                                            <p className="text-gray-300 text-sm">Save your creations</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-6 text-center border border-gray-600">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <AlertCircle className="w-5 h-5 text-orange-400" />
                                        <span className="text-orange-400 font-semibold">With Watermark</span>
                                    </div>
                                    <p className="text-gray-300 text-sm">Flowy logo included</p>
                                </div>
                                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-center border border-blue-500 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-800/30"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                            <span className="text-green-400 font-semibold">Clean Export</span>
                                        </div>
                                        <p className="text-blue-100 text-sm">No watermark</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Export formats */}
                            <motion.div
                                className="grid grid-cols-3 gap-6 items-center"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                viewport={{ once: true }}
                            >
                                <div className="bg-gradient-to-br from-[#292C31] to-[#1F2125] rounded-2xl p-6 border border-gray-700/50">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                                            <FileText className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white">Export Formats</h4>
                                            <p className="text-gray-300 text-sm">Available file types</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-6 text-center border border-gray-600">
                                    <div className="flex flex-wrap justify-center gap-2 mb-2">
                                        <span className="px-3 py-1 bg-gray-600 text-white text-xs rounded-full">PNG</span>
                                        <span className="px-3 py-1 bg-gray-600 text-white text-xs rounded-full">JPG</span>
                                    </div>
                                    <p className="text-gray-300 text-sm">Basic formats</p>
                                </div>
                                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-center border border-blue-500 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-800/30"></div>
                                    <div className="relative z-10">
                                        <div className="flex flex-wrap justify-center gap-2 mb-2">
                                            <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full">PDF</span>
                                            <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full">JSON</span>
                                            <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full">WEBP</span>
                                            <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full">SVG</span>
                                        </div>
                                        <p className="text-blue-100 text-sm">Additional formats</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Image search */}
                            <motion.div
                                className="grid grid-cols-3 gap-6 items-center"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                viewport={{ once: true }}
                            >
                                <div className="bg-gradient-to-br from-[#292C31] to-[#1F2125] rounded-2xl p-6 border border-gray-700/50">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white">Image Search</h4>
                                            <p className="text-gray-300 text-sm">Pixabay & Unsplash integration</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-6 text-center border border-gray-600">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        <span className="text-red-400 font-semibold">Not Available</span>
                                    </div>
                                    <p className="text-gray-300 text-sm">Upload only</p>
                                </div>
                                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-center border border-blue-500 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-800/30"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                            <span className="text-green-400 font-semibold">Full Access</span>
                                        </div>
                                        <p className="text-blue-100 text-sm">Search millions of images</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        
                    </div>
                </div>
            </section>

            <section id="team" className="py-20 px-6 bg-[#25282C]">
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
                            Forged by enthusiasts to unlock easy design for newcomers.
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

            <section className="py-20 px-6">
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
                        <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
                            Join thousands of creators who have already discovered the power of our creative platform. Start your journey today - it's free to get started.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Button
                                onClick={toggleView}
                                variant="secondary"
                                className="font-semibold text-lg rounded-full bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-full text-white font-semibold "
                            >
                                <Zap className="!w-7 !h-7" />
                                <span>Start Now for Free</span>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <footer className="py-12 px-6 bg-[#1F2125] border-t border-gray-700/50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center space-x-3 mb-6 md:mb-0">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                                <Blend className="!h-7 !w-7 " />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                                <p className="cursor-pointer">Flowy</p>
                            </span>
                        </div>
                        <div className="flex items-center space-x-6">
                            <button onClick={() => setShowPrivacy(true)} className="cursor-pointer text-gray-400 hover:text-blue-400 transition-colors">Privacy</button>
                            <button onClick={() => setShowTerms(true)} className="cursor-pointer text-gray-400 hover:text-blue-400 transition-colors">Terms</button>

                            <CustomDropdown
                                trigger={
                                    <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.66-.22.66-.49v-1.7c-2.78.61-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03A9.564 9.564 0 0112 6.8c.85.004 1.71.11 2.52.33 1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.56.94.56 1.92v2.84c0 .27.16.58.67.49A10.01 10.01 0 0022 12c0-5.52-4.48-10-10-10z" />
                                    </svg>
                                }
                            >
                                <a
                                    href="https://github.com/Strawberry-Team/ucode-connect-Track-FullStack-flowy-backend"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full px-4 py-2 hover:bg-[#414448FF] focus:bg-[#3F434AFF] cursor-pointer text-gray-200 rounded"
                                >
                                    Backend
                                </a>
                                <a
                                    href="https://github.com/Strawberry-Team/ucode-connect-Track-FullStack-flowy-frontend"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full px-4 py-2 hover:bg-[#414448FF] focus:bg-[#3F434AFF] cursor-pointer text-gray-200 rounded"
                                >
                                    Frontend
                                </a>
                            </CustomDropdown>
                            <motion.a href="https://mail.google.com/mail/?view=cm&fs=1&to=support@flowy.com" target="_blank" className="w-10 h-10 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </motion.a>

                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-700/50 text-center text-gray-400">
                        <p>© 2025 Flowy. Made with 💙 for creators everywhere.</p>
                    </div>
                </div>
            </footer>

            <PrivacyDialog />
            <TermsDialog />
        </>
    );
};

export default ProductLanding;