import { BarChart, PlusCircle, ShoppingBasket, FolderTree, ClipboardList, LayoutGrid, Images } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import useTranslation from "../hooks/useTranslation";

import AnalyticsTab from "../components/AnalyticsTab";
import CreateProductForm from "../components/CreateProductForm";
import ProductsList from "../components/ProductsList";
import CategoryManager from "../components/CategoryManager";
import SectionManager from "../components/SectionManager";
import AdminOrders from "../components/AdminOrders";
import SliderManager from "../components/SliderManager";
import { useProductStore } from "../stores/useProductStore";

const AdminPage = () => {
        const [activeTab, setActiveTab] = useState("create");
        const { fetchAllProducts } = useProductStore();
        const { t } = useTranslation();

        useEffect(() => {
                fetchAllProducts();
        }, [fetchAllProducts]);

        const tabs = useMemo(
                () => [
                        { id: "create", label: t("admin.tabs.create"), icon: PlusCircle },
                        { id: "products", label: t("admin.tabs.products"), icon: ShoppingBasket },
                        { id: "sections", label: t("admin.tabs.sections"), icon: LayoutGrid },
                        { id: "slider", label: t("admin.tabs.slider"), icon: Images },
                        { id: "categories", label: t("admin.tabs.categories"), icon: FolderTree },
                        { id: "analytics", label: t("admin.tabs.analytics"), icon: BarChart },
                        { id: "orders", label: t("admin.tabs.orders"), icon: ClipboardList },
                ],
                [t]
        );

        return (
                <div className='relative min-h-screen overflow-hidden bg-ali-bg text-ali-ink'>
                        <div className='container relative z-10 mx-auto px-4 py-16'>
                                <motion.h1
                                        className='mb-8 text-center text-4xl font-bold text-ali-ink'
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8 }}
                                >
                                        {t("admin.dashboardTitle")}
                                </motion.h1>

                                <div className='mb-8 overflow-x-auto pb-2'>
                                        <div className='flex min-w-max items-center justify-start gap-3 md:justify-center'>
                                                {tabs.map((tab) => (
                                                        <button
                                                                key={tab.id}
                                                                onClick={() => setActiveTab(tab.id)}
                                                                className={`flex flex-shrink-0 items-center rounded-md px-4 py-2 transition-colors duration-200 ${
                                                                        activeTab === tab.id
                                                                                ? "bg-payzone-gold text-ali-ink"
                                                                                : "bg-ali-card text-ali-muted hover:bg-white"
                                                                }`}
                                                        >
                                                                <tab.icon className='ml-2 h-5 w-5' />
                                                                <span className='whitespace-nowrap'>{tab.label}</span>
                                                        </button>
                                                ))}
                                        </div>
                                </div>
                                {activeTab === "create" && <CreateProductForm />}
                                {activeTab === "products" && <ProductsList onEdit={() => setActiveTab("create")} />}
                                {activeTab === "sections" && <SectionManager />}
                                {activeTab === "slider" && <SliderManager />}
                                {activeTab === "categories" && <CategoryManager />}
                                {activeTab === "analytics" && <AnalyticsTab />}
                                {activeTab === "orders" && <AdminOrders />}
                        </div>
                </div>
        );
};
export default AdminPage;
