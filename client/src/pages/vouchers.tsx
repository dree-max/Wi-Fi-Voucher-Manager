import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Ticket, CheckCircle, Clock } from "lucide-react";
import CreateVoucherModal from "@/components/modals/create-voucher-modal";
import { getStatusColor, formatDuration } from "@/lib/utils";

export default function Vouchers() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const event = new CustomEvent('pageChange', {
      detail: {
        title: 'Voucher Management',
        subtitle: 'Create and manage WiFi access vouchers'
      }
    });
    window.dispatchEvent(event);
  }, []);

  const { data: vouchers = [], isLoading } = useQuery({
    queryKey: ["/api/vouchers"],
  });

  const { data: stats = {} } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const filteredVouchers = vouchers.filter((voucher: any) => {
    const matchesStatus = statusFilter === "all" || voucher.status === statusFilter;
    const matchesSearch = voucher.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Voucher Management</h3>
          <p className="text-sm text-gray-500">Create and manage WiFi access vouchers</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2">
          <Plus size={16} />
          <span>Create Vouchers</span>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Vouchers</p>
                <p className="text-2xl font-bold text-gray-900">5,432</p>
              </div>
              <Ticket className="text-primary" size={32} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeVouchers || 0}</p>
              </div>
              <CheckCircle className="text-green-600" size={32} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-gray-500">3,198</p>
              </div>
              <Clock className="text-gray-500" size={32} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voucher Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Vouchers</CardTitle>
            <div className="flex items-center space-x-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Search vouchers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Voucher Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Data Limit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVouchers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No vouchers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVouchers.map((voucher: any) => (
                    <TableRow key={voucher.id} className="hover:bg-gray-50">
                      <TableCell>
                        <code className="font-mono text-sm font-medium text-gray-900">
                          {voucher.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {voucher.plan?.name || 'Custom'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {voucher.plan?.duration ? formatDuration(voucher.plan.duration) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {voucher.plan?.dataLimit ? `${voucher.plan.dataLimit} MB` : 'Unlimited'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(voucher.status)}>
                          {voucher.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(voucher.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark">
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-900">
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-700">
                Showing {Math.min(filteredVouchers.length, 10)} of {filteredVouchers.length} results
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button size="sm">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <CreateVoucherModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />
    </div>
  );
}
