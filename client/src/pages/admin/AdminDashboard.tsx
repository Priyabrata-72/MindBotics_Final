import { useEffect, useState } from "react";
import { Users, BookOpen, UserCircle, Activity, FolderKanban, Cuboid, DollarSign, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        counts: {
            users: 0,
            courses: 0,
            contacts: 0,
            projects: 0,
            threeDDesigns: 0,
        },
        recentActivity: [],
        payments: {
            totalOrders: 0,
            totalRevenue: 0,
            refundedOrders: 0,
            totalRefundAmount: 0,
            chartData: []
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getStats = async () => {
            try {
                const [adminRes, paymentRes] = await Promise.all([
                    api.get("/admin"),
                    api.get("/admin/payments/stats").catch(() => ({ data: {} })) // fallback if not available
                ]);
                
                const data = adminRes.data;
                const paymentData = paymentRes.data || {};
                
                if (data && data.counts) {
                    setStats({
                        ...data,
                        payments: {
                            totalOrders: paymentData.totalOrders || 0,
                            totalRevenue: paymentData.totalRevenue || 0,
                            refundedOrders: paymentData.refundedOrders || 0,
                            totalRefundAmount: paymentData.totalRefundAmount || 0,
                            chartData: paymentData.chartData || []
                        }
                    });
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };
        getStats();
    }, []);

    if (loading) {
        return <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-32" />)}
            </div>
            <Skeleton className="h-64" />
        </div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back to the Admin Panel.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{stats.payments.totalRevenue}</div>
                        <p className="text-xs text-muted-foreground">From paid orders</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Refund Amount</CardTitle>
                        <RotateCcw className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{stats.payments.totalRefundAmount}</div>
                        <p className="text-xs text-muted-foreground">Total refunded</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.counts.users}</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.counts.courses}</div>
                        <p className="text-xs text-muted-foreground">+2 new courses this week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Contact Users</CardTitle>
                        <UserCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.counts.contacts}</div>
                        <p className="text-xs text-muted-foreground">+19% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.counts.projects}</div>
                        <p className="text-xs text-muted-foreground">All listed project entries</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total 3D Designs</CardTitle>
                        <Cuboid className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.counts.threeDDesigns}</div>
                        <p className="text-xs text-muted-foreground">All 3D designs in the catalog</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.payments.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">Across all statuses</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Revenue Overview (Last 30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            {stats.payments.chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.payments.chartData}>
                                        <XAxis 
                                          dataKey="date" 
                                          stroke="#888888" 
                                          fontSize={12} 
                                          tickLine={false} 
                                          axisLine={false} 
                                          tickFormatter={(value) => value.slice(5)}
                                        />
                                        <YAxis
                                          stroke="#888888"
                                          fontSize={12}
                                          tickLine={false}
                                          axisLine={false}
                                          tickFormatter={(value) => `₹${value}`}
                                        />
                                        <Tooltip 
                                          cursor={{ fill: 'transparent' }} 
                                          formatter={(value: number) => [`₹${value}`, "Revenue"]}
                                          labelFormatter={(label) => `Date: ${label}`}
                                          contentStyle={{ borderRadius: '8px', border: '1px solid #eaeaea' }}
                                        />
                                        <Bar 
                                          dataKey="revenue" 
                                          fill="currentColor" 
                                          radius={[4, 4, 0, 0]} 
                                          className="fill-primary" 
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground bg-gray-50 rounded-md">
                                    No chart data available
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {stats.recentActivity.map((activity: any) => (
                                <div key={activity.id} className="flex items-center">
                                    <Activity className="h-4 w-4 text-blue-500 mr-4" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{activity.action}</p>
                                        <p className="text-xs text-muted-foreground">{activity.detail}</p>
                                    </div>
                                    <div className="ml-auto font-medium text-xs text-gray-400">{activity.time}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
