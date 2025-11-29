import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Users, Package, ShoppingCart, DollarSign } from "lucide-react";
import useTranslation from "../hooks/useTranslation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import apiClient from "../lib/apiClient";
import { formatMRU } from "../lib/formatMRU";
import { formatNumberEn } from "../lib/formatNumberEn";

const AnalyticsTab = () => {
        const [analyticsData, setAnalyticsData] = useState({
                users: 0,
                products: 0,
                totalSales: 0,
                totalRevenue: 0,
        });
        const [isLoading, setIsLoading] = useState(true);
        const [dailySalesData, setDailySalesData] = useState([]);
        const { t } = useTranslation();

        useEffect(() => {
                const fetchAnalyticsData = async () => {
                        try {
                                const data = await apiClient.get("/analytics");
                                setAnalyticsData(data.analyticsData);
                                const normalizedDailyData = Array.isArray(data.dailySalesData)
                                        ? data.dailySalesData.map((entry) => ({
                                                  date: entry.date,
                                                  sales: Number(entry.sales || 0),
                                                  revenue: Number(entry.revenue || 0),
                                          }))
                                        : [];
                                setDailySalesData(normalizedDailyData);
                        } catch (error) {
                                console.error("Error fetching analytics data:", error);
                        } finally {
                                setIsLoading(false);
                        }
                };

                fetchAnalyticsData();
        }, []);

        if (isLoading) {
                return <div>{t("admin.analytics.loading")}</div>;
        }

        return (
                <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                        <div className='mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                                <AnalyticsCard
                                        title={t("admin.analytics.cards.users")}
                                        value={formatNumberEn(analyticsData.users)}
                                        icon={Users}
                                        gradient='from-white via-white to-white'
                                />
                                <AnalyticsCard
                                        title={t("admin.analytics.cards.products")}
                                        value={formatNumberEn(analyticsData.products)}
                                        icon={Package}
                                        gradient='from-white via-white to-white'
                                />
                                <AnalyticsCard
                                        title={t("admin.analytics.cards.sales")}
                                        value={formatNumberEn(analyticsData.totalSales)}
                                        icon={ShoppingCart}
                                        gradient='from-white via-white to-white'
                                />
                                <AnalyticsCard
                                        title={t("admin.analytics.cards.revenue")}
                                        value={formatMRU(analyticsData.totalRevenue)}
                                        icon={DollarSign}
                                        gradient='from-white via-white to-white'
                                />
                        </div>
                        <motion.div
                                className='rounded-xl border border-ali-card bg-white p-6 shadow-sm'
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.25 }}
                        >
                                <ResponsiveContainer width='100%' height={400}>
                                        <LineChart data={dailySalesData}>
                                                <CartesianGrid stroke='rgba(17,24,39,0.08)' strokeDasharray='3 3' />
                                                <XAxis dataKey='date' stroke='#111827' tick={{ fill: "#111827" }} />
                                                <YAxis yAxisId='left' stroke='#111827' tick={{ fill: "#111827" }} />
                                                <YAxis yAxisId='right' orientation='right' stroke='#111827' tick={{ fill: "#111827" }} />
                                                <Tooltip
                                                        contentStyle={{ backgroundColor: "#ffffff", borderRadius: "0.75rem", border: "1px solid #e5e7eb", color: "#111827" }}
                                                        itemStyle={{ color: "#111827" }}
                                                        labelStyle={{ color: "#111827" }}
                                                />
                                                <Legend wrapperStyle={{ color: "#111827" }} />
                                                <Line
                                                        yAxisId='left'
                                                        type='monotone'
                                                        dataKey='sales'
                                                        stroke='#D29C4A'
                                                        strokeWidth={3}
                                                        activeDot={{ r: 8 }}
                                                        name={t("admin.analytics.chart.sales")}
                                                />
                                                <Line
                                                        yAxisId='right'
                                                        type='monotone'
                                                        dataKey='revenue'
                                                        stroke='#4B4ACF'
                                                        strokeWidth={3}
                                                        activeDot={{ r: 8 }}
                                                        name={t("admin.analytics.chart.revenue")}
                                                />
                                        </LineChart>
                                </ResponsiveContainer>
                        </motion.div>
                </div>
        );
};
export default AnalyticsTab;

const AnalyticsCard = ({ title, value, icon: Icon, gradient }) => (
        <motion.div
                className='relative overflow-hidden rounded-xl border border-ali-card bg-white p-6 shadow-sm'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
        >
                <div className='absolute inset-0 opacity-70'>
                        <div className={`h-full w-full bg-gradient-to-br ${gradient}`} />
                </div>
                <div className='relative z-10 flex justify-between text-ali-ink'>
                        <div>
                                <p className='mb-1 text-xs font-semibold uppercase tracking-wide text-ali-muted'>{title}</p>
                                <h3 className='text-3xl font-bold text-ali-ink'>{value}</h3>
                        </div>
                        <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-ali-card text-payzone-gold'>
                                <Icon className='h-6 w-6' />
                        </div>
                </div>
                <div className='absolute inset-0 bg-gradient-to-br from-white via-transparent to-transparent opacity-70' />
        </motion.div>
);

AnalyticsCard.propTypes = {
        title: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        icon: PropTypes.elementType.isRequired,
        gradient: PropTypes.string.isRequired,
};
