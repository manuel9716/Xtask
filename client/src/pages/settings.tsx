import { useState } from "react";
import { Settings as SettingsIcon, Globe, Bell, Shield, Palette, Building, CreditCard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/logo";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Manage your application settings and preferences</p>
        </div>
      </div>
      
      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="h-4 w-4" /> Company
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Billing
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Security
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your basic application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="app-name">Application Name</Label>
                <Input id="app-name" defaultValue="XTask" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="app-url">Application URL</Label>
                <div className="flex items-center space-x-2">
                  <Input id="app-url" defaultValue="https://xtask-app.com" />
                  <Button variant="outline" size="icon">
                    <Globe className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input id="support-email" type="email" defaultValue="support@xtask-app.com" />
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Label>System Preferences</Label>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="debug-mode">Debug Mode</Label>
                      <p className="text-sm text-gray-500">Enable detailed error reporting for development</p>
                    </div>
                    <Switch id="debug-mode" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                      <p className="text-sm text-gray-500">Put application in maintenance mode</p>
                    </div>
                    <Switch id="maintenance-mode" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="analytics">Usage Analytics</Label>
                      <p className="text-sm text-gray-500">Collect anonymous usage data to improve the application</p>
                    </div>
                    <Switch id="analytics" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of your application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Company Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="p-4 border rounded-lg flex items-center justify-center">
                    <Logo size="lg" textClassName="text-gray-900" className="bg-primary-500" />
                  </div>
                  <div>
                    <Button variant="outline" className="mb-2">Upload New Logo</Button>
                    <p className="text-sm text-gray-500">Recommended size: 256x256px. SVG, PNG or JPG.</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Theme Colors</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color" className="text-sm">Primary Color</Label>
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-full bg-primary-500 border"></div>
                      <Input id="primary-color" defaultValue="#3B82F6" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secondary-color" className="text-sm">Secondary Color</Label>
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-full bg-orange-500 border"></div>
                      <Input id="secondary-color" defaultValue="#F97316" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accent-color" className="text-sm">Accent Color</Label>
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-full bg-indigo-500 border"></div>
                      <Input id="accent-color" defaultValue="#6366F1" />
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Theme Mode</Label>
                <ThemeSelector />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Appearance</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Manage your company details and profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" defaultValue="XTask Inc." />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-industry">Industry</Label>
                  <Select defaultValue="technology">
                    <SelectTrigger id="company-industry">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-size">Company Size</Label>
                  <Select defaultValue="11-50">
                    <SelectTrigger id="company-size">
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="501-1000">501-1000 employees</SelectItem>
                      <SelectItem value="1000+">1000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-website">Website</Label>
                  <Input id="company-website" defaultValue="https://xtask-company.com" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company-address">Address</Label>
                <Textarea id="company-address" defaultValue="123 Business Street, Tech Plaza, San Francisco, CA 94103, United States" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Phone Number</Label>
                  <Input id="company-phone" defaultValue="+1 (555) 123-4567" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-email">Email</Label>
                  <Input id="company-email" type="email" defaultValue="info@xtask-company.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-tax-id">Tax ID / VAT</Label>
                  <Input id="company-tax-id" defaultValue="US12345678" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company-description">Company Description</Label>
                <Textarea id="company-description" rows={4} defaultValue="XTask Inc. is a leading provider of enterprise management solutions, helping businesses streamline operations and improve productivity through innovative software." />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update Company Information</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <CardDescription>Manage your payment methods and subscription plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Current Plan</h3>
                <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-primary-700">Business Pro Plan</h4>
                    <p className="text-sm text-gray-600">$49.99 / month</p>
                    <p className="text-xs text-gray-500 mt-1">Renews on October 15, 2023</p>
                  </div>
                  <Button variant="outline">Upgrade Plan</Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Payment Methods</h3>
                
                <div className="border rounded-lg p-4 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 p-2 rounded">
                      <CreditCard className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">•••• •••• •••• 4242</h4>
                      <p className="text-sm text-gray-500">Visa - Expires 12/2024</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Default</Badge>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
                
                <Button variant="outline" className="mt-2 w-full md:w-auto">
                  <CreditCard className="mr-2 h-4 w-4" /> Add Payment Method
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Billing History</h3>
                <div className="border rounded-lg divide-y">
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Invoice #INV-2023-001</h4>
                      <p className="text-sm text-gray-500">September 15, 2023</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Paid</Badge>
                      <Button variant="ghost" size="sm" className="flex items-center">
                        PDF <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Invoice #INV-2023-002</h4>
                      <p className="text-sm text-gray-500">August 15, 2023</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Paid</Badge>
                      <Button variant="ghost" size="sm" className="flex items-center">
                        PDF <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Invoice #INV-2023-003</h4>
                      <p className="text-sm text-gray-500">July 15, 2023</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Paid</Badge>
                      <Button variant="ghost" size="sm" className="flex items-center">
                        PDF <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-projects">Project Updates</Label>
                      <p className="text-sm text-gray-500">Receive updates about projects you're involved in</p>
                    </div>
                    <Switch id="email-projects" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-tasks">Task Assignments</Label>
                      <p className="text-sm text-gray-500">Get notified when you're assigned to a task</p>
                    </div>
                    <Switch id="email-tasks" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-finance">Financial Updates</Label>
                      <p className="text-sm text-gray-500">Receive notifications about financial transactions</p>
                    </div>
                    <Switch id="email-finance" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-system">System Notifications</Label>
                      <p className="text-sm text-gray-500">Important updates about system maintenance and changes</p>
                    </div>
                    <Switch id="email-system" defaultChecked />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">In-App Notifications</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="app-projects">Project Updates</Label>
                      <p className="text-sm text-gray-500">Show project updates in the notification center</p>
                    </div>
                    <Switch id="app-projects" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="app-tasks">Task Assignments</Label>
                      <p className="text-sm text-gray-500">Show task assignments in the notification center</p>
                    </div>
                    <Switch id="app-tasks" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="app-finance">Financial Updates</Label>
                      <p className="text-sm text-gray-500">Show financial updates in the notification center</p>
                    </div>
                    <Switch id="app-finance" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="app-system">System Notifications</Label>
                      <p className="text-sm text-gray-500">Show system notifications in the notification center</p>
                    </div>
                    <Switch id="app-system" defaultChecked />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="digest-frequency">Notification Digest Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger id="digest-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  This setting determines how often you receive notification digests via email
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Notification Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Password</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </div>
                
                <Button className="mt-2">Change Password</Button>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-4">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <Shield className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Two-factor authentication is not enabled</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Add an extra layer of security to your account by enabling two-factor authentication.
                      </p>
                      <Button variant="outline" className="mt-3">Enable 2FA</Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Session Management</h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <Globe className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Current Session</h4>
                          <p className="text-sm text-gray-500">Chrome on Windows • San Francisco, USA</p>
                          <p className="text-xs text-gray-400">Started 1 hour ago</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200">Active Now</Badge>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gray-100 p-2 rounded-full">
                          <Globe className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Mobile Session</h4>
                          <p className="text-sm text-gray-500">Safari on iPhone • San Francisco, USA</p>
                          <p className="text-xs text-gray-400">Last active 3 days ago</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-500">Revoke</Button>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="mt-2 bg-red-50 text-red-600 hover:bg-red-100">Sign Out All Devices</Button>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Advanced Security</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="login-history">Save Login History</Label>
                      <p className="text-sm text-gray-500">Keep a record of when and where you log in</p>
                    </div>
                    <Switch id="login-history" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="suspicious-activity">Suspicious Activity Alerts</Label>
                      <p className="text-sm text-gray-500">Get notified about unusual login attempts</p>
                    </div>
                    <Switch id="suspicious-activity" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${className}`}>
      {children}
    </span>
  );
}
