import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";

const faqs = [
    {
        question: "What is the typical course duration?",
        answer: "Most of our professional courses range from 8 to 12 weeks, depending on the complexity of the subject and the learning pace.",
    },
    {
        question: "Are the certifications industry-recognized?",
        answer: "Yes, MindBotics certifications are recognized by leading tech companies and are evidence of your hands-on project experience.",
    },
    {
        question: "Do you offer placement support?",
        answer: "Absolutely! We providing resume building, mock interviews, and direct referrals to our network of 50+ hiring partners.",
    },
    {
        question: "Is the learning project-based?",
        answer: "100%. We believe in 'learning by doing'. Every course includes at least 3-5 real-world industry projects.",
    },
    {
        question: "What is your refund policy?",
        answer: "We offer a full 7-day money-back guarantee if you're not satisfied with the course content or teaching methodology.",
    },
    {
        question: "Do I get mentor guidance?",
        answer: "Yes, every student is assigned a dedicated mentor who provides weekly 1-on-1 feedback and doubt-clearing sessions.",
    },
    {
        question: "Are there any prerequisites?",
        answer: "Prerequisites vary by course. Most beginner courses require only basic computer literacy and a passion for technology.",
    },
    {
        question: "Can I access course materials after completion?",
        answer: "Yes, you get lifetime access to the course recordings, project resources, and our exclusive alumni community.",
    },
];

const FAQSection = () => {
    const [api, setApi] = useState<CarouselApi>();

    useEffect(() => {
        if (!api) return;

        const interval = setInterval(() => {
            api.scrollNext();
        }, 3000); // Scroll every 3 seconds

        return () => clearInterval(interval);
    }, [api]);

    return (
        <section className="py-20 bg-background overflow-hidden">
            <div className="container mx-auto px-4">
                {/* HEADER */}
                <div className="text-center max-w-3xl mx-auto mb-16 px-4">
                    <span className="text-primary font-semibold uppercase tracking-wider text-sm">
                        Questions & Answers
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Find quick answers to common queries about our platform, courses,
                        and commitment to your tech career.
                    </p>
                </div>

                {/* FAQ CAROUSEL */}
                <div className="relative px-4 md:px-12">
                    <Carousel
                        setApi={setApi}
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-4">
                            {faqs.map((faq, index) => (
                                <CarouselItem
                                    key={index}
                                    className="pl-4 md:basis-1/2 lg:basis-1/3"
                                >
                                    <div className="h-full group relative py-4">
                                        {/* Decorative Accent */}
                                        <div className="absolute top-4 left-0 right-0 h-1.5 bg-primary rounded-t-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-10" />

                                        <Card className="h-full bg-white border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] transition-all duration-500 rounded-2xl overflow-hidden group-hover:-translate-y-2">
                                            <CardContent className="p-8 flex flex-col h-full relative z-0">
                                                {/* Number/Icon Badge */}
                                                <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 ease-out shadow-sm group-hover:shadow-primary/30 group-hover:rotate-12">
                                                    <HelpCircle className="w-7 h-7" />
                                                </div>

                                                <h3 className="text-xl font-bold text-foreground mb-4 leading-tight transition-colors duration-300 group-hover:text-primary">
                                                    {faq.question}
                                                </h3>

                                                <div className="w-12 h-1 bg-primary/20 mb-6 group-hover:w-full transition-all duration-500" />

                                                <p className="text-muted-foreground text-sm leading-relaxed">
                                                    {faq.answer}
                                                </p>

                                                {/* Bottom Decoration */}
                                                <div className="absolute bottom-0 right-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-300 pointer-events-none translate-x-1/4 translate-y-1/4">
                                                    <HelpCircle className="w-32 h-32" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <div className="flex justify-center mt-12 gap-4">
                            <CarouselPrevious className="static translate-y-0" />
                            <CarouselNext className="static translate-y-0" />
                        </div>
                    </Carousel>
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
