import React, { useState, Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
    Palette, 
    Type, 
    Download, 
    UploadCloud, 
    Sparkles,
    CheckCircle,
    X,
    Image as ImageIcon,
    Shapes,
    Camera,
    Copy
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface BrandKit {
    logoUrl: string;
    logoOnDarkUrl: string;
    logoIconUrl: string;
    colors: { name: string; hex: string }[];
    fonts: { primary: { name: string; weight: string}, secondary: { name: string; weight: string} };
    elements: string[];
    photos: string[];
    brandVoice?: string;
}

// --- MOCK DATA ---
const initialBrandKitData: BrandKit = {
    logoUrl: 'https://i0.wp.com/dotspeaks.com/wp-content/uploads/2025/07/Dotspeaks-logo.png?fit=2560%2C591&ssl=1',
    logoOnDarkUrl: 'https://i0.wp.com/dotspeaks.com/wp-content/uploads/2025/07/Dotspeaks-logo_bg.png?fit=2560%2C591&ssl=1',
    logoIconUrl: 'https://placehold.co/100x100/0000CD/ffffff?text=D',
    colors: [
        { name: 'Primary Blue', hex: '#0000CD' },
        { name: 'Vibrant Red', hex: '#D70707' },
        { name: 'Accent Pink', hex: '#FF20A7' },
        { name: 'Neutral Gray', hex: '#4B5563' },
    ],
    fonts: {
        primary: { name: 'Inter', weight: 'Bold' },
        secondary: { name: 'Roboto', weight: 'Regular' }
    },
    elements: [
        'https://img.freepik.com/premium-vector/set-hand-drawn-ink-arrow-illustration-business-doodle-clipart-single-element-design_645998-3922.jpg',
        'https://img.freepik.com/premium-vector/set-hand-drawn-ink-arrow-illustration-business-doodle-clipart-single-element-design_645998-3922.jpg',
        'https://img.freepik.com/premium-vector/set-hand-drawn-ink-arrow-illustration-business-doodle-clipart-single-element-design_645998-3922.jpg',
        'https://img.freepik.com/premium-vector/set-hand-drawn-ink-arrow-illustration-business-doodle-clipart-single-element-design_645998-3922.jpg',
    ],
    photos: [
        'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2874&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2940&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=2831&auto=format&fit=crop'
    ],
    brandVoice: "A modern, trustworthy, and innovative brand that communicates with clarity and confidence."
};

// --- HELPER COMPONENT for Section Headers ---
interface SectionHeaderProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon: Icon, title }) => (
    <div className="flex items-center pb-2 border-b-2 border-blue-600">
        <Icon className="h-6 w-6 text-blue-600 mr-3"/>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
    </div>
);


// --- MAIN COMPONENT ---
const ClientBrankKit = () => {
    const [brandKit, setBrandKit] = useState<BrandKit>(initialBrandKitData);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [copiedHex, setCopiedHex] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64Logo = reader.result?.toString().split(',')[1];
                if (base64Logo) {
                    analyzeLogoWithGemini(base64Logo, URL.createObjectURL(file));
                }
            };
        }
    };

    const analyzeLogoWithGemini = async (base64ImageData: string, newLogoUrl: string) => {
        setIsAnalyzing(true);
        const prompt = `Analyze the provided logo image. Based on its visual elements, provide a brand analysis. Return a JSON object with two keys: 
        1. "colors": an array of 4 objects, each with "name" (a creative name for the color) and "hex" (the hex code).
        2. "brandVoice": a one-sentence description of the brand's personality.
        Example: {"colors": [{"name": "Corporate Blue", "hex": "#0047AB"}], "brandVoice": "A modern, trustworthy, and innovative brand."}`;

        try {
            const payload = {
                contents: [{
                    role: "user",
                    parts: [
                        { text: prompt },
                        { inlineData: { mimeType: "image/png", data: base64ImageData } }
                    ]
                }],
                 generationConfig: { responseMimeType: "application/json" }
            };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            const analysis = JSON.parse(result.candidates[0].content.parts[0].text);

            setBrandKit(prev => ({
                ...prev,
                logoUrl: newLogoUrl,
                logoOnDarkUrl: newLogoUrl,
                colors: analysis.colors,
                brandVoice: analysis.brandVoice,
            }));

        } catch (error) {
            console.error("Error calling Gemini API:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedHex(text);
        setTimeout(() => setCopiedHex(null), 2000);
    };

    return (
        <div className="p-8 bg-white min-h-screen">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-gray-900">Brand Guidelines</h1>
                    <p className="mt-4 text-lg text-gray-600">Your complete brand identity, assets, and guidelines for consistent and professional communication.</p>
                </div>

                <div className="space-y-12">
                    {/* Logos */}
                    <section>
                        <SectionHeader icon={ImageIcon} title="Logo" />
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div>
                                <p className="font-semibold mb-2">Primary Logo</p>
                                <div className="bg-gray-100 p-8 rounded-lg flex items-center justify-center h-48 border">
                                    <img src={brandKit.logoUrl} alt="Primary Logo on Light" className="max-w-full max-h-24 h-auto"/>
                                </div>
                                <div className="bg-gray-900 mt-4 p-8 rounded-lg flex items-center justify-center h-48 border">
                                    <img src={brandKit.logoOnDarkUrl} alt="Primary Logo on Dark" className="max-w-full max-h-24 h-auto"/>
                                </div>
                            </div>
                            <div>
                                <p className="font-semibold mb-2">Icon / Mark</p>
                                <div className="bg-gray-100 p-8 rounded-lg flex items-center justify-center h-48 border">
                                     <img src={brandKit.logoIconUrl} alt="Logo Icon" className="h-24 w-24"/>
                                </div>
                                <div className="mt-4 flex space-x-2">
                                    <button onClick={() => fileInputRef.current?.click()} disabled={isAnalyzing} className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 disabled:opacity-50">
                                        <UploadCloud className="h-4 w-4 mr-2"/>
                                        {isAnalyzing ? 'Analyzing...' : 'Upload & Analyze'}
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*"/>
                                    <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                                        <Download className="h-4 w-4 mr-2"/> Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                    
                    {/* Brand Voice */}
                    {brandKit.brandVoice && (
                        <section>
                            <SectionHeader icon={Sparkles} title="Brand Voice" />
                            <div className="mt-6 bg-purple-50 border border-purple-200 p-6 rounded-lg">
                                <p className="text-purple-800 text-lg italic leading-relaxed">"{brandKit.brandVoice}"</p>
                            </div>
                        </section>
                    )}

                    {/* Color Palette */}
                    <section>
                        <SectionHeader icon={Palette} title="Color Palette" />
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                            {brandKit.colors.map(color => (
                                <div key={color.hex}>
                                    <div className="h-32 rounded-lg" style={{ backgroundColor: color.hex }}></div>
                                    <p className="mt-2 font-semibold text-gray-800">{color.name}</p>
                                    <button onClick={() => copyToClipboard(color.hex)} className="text-xs text-gray-500 uppercase flex items-center hover:text-blue-600">
                                        {color.hex}
                                        <Copy className="h-3 w-3 ml-1.5"/>
                                        {copiedHex === color.hex && <span className="ml-2 text-blue-600 text-xs">Copied!</span>}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Typography */}
                    <section>
                        <SectionHeader icon={Type} title="Typography" />
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-gray-50 p-6 rounded-lg border">
                                <p className="text-sm text-gray-500">Primary Font (Headings)</p>
                                <p className="text-5xl font-bold mt-2" style={{ fontFamily: brandKit.fonts.primary.name }}>{brandKit.fonts.primary.name}</p>
                                <p className="text-sm text-gray-500">{brandKit.fonts.primary.weight}</p>
                                <p className="text-2xl mt-4" style={{ fontFamily: brandKit.fonts.primary.name }}>Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz</p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-lg border">
                                <p className="text-sm text-gray-500">Secondary Font (Body)</p>
                                <p className="text-3xl mt-2" style={{ fontFamily: brandKit.fonts.secondary.name }}>{brandKit.fonts.secondary.name}</p>
                                <p className="text-sm text-gray-500">{brandKit.fonts.secondary.weight}</p>
                                <p className="mt-4 text-md" style={{ fontFamily: brandKit.fonts.secondary.name }}>Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz</p>
                            </div>
                        </div>
                    </section>

                    {/* Elements & Photography */}
                    <section>
                        <SectionHeader icon={Shapes} title="Elements & Illustrations" />
                        <div className="mt-6 flex space-x-4 p-4 bg-gray-100 rounded-lg justify-center border">
                            {brandKit.elements.map((el, i) => <img key={i} src={el} className="h-20 w-20 object-contain mix-blend-multiply" alt={`Element ${i+1}`}/>)}
                        </div>
                    </section>
                    <section>
                        <SectionHeader icon={Camera} title="Photography Style" />
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {brandKit.photos.map((photo, i) => <img key={i} src={photo} className="w-full h-48 object-cover rounded-lg" alt={`Photo ${i+1}`}/>)}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ClientBrankKit;
