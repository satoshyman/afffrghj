import { useUser } from "@/hooks/use-user";
import { useWithdrawals, useCreateWithdrawal } from "@/hooks/use-withdrawals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet as WalletIcon, ArrowUpRight, History, AlertCircle, Coins, TrendingUp } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const MIN_WITHDRAWAL = 0.01;

const withdrawSchema = z.object({
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Invalid amount"),
  walletAddress: z.string().min(10, "Wallet address is too short"),
});

export default function Wallet() {
  const { data: user } = useUser();
  const { data: withdrawals, isLoading: isLoadingHistory } = useWithdrawals();
  const { mutate: withdraw, isPending } = useCreateWithdrawal();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof withdrawSchema>>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: "",
      walletAddress: "",
    },
  });

  const onSubmit = (data: z.infer<typeof withdrawSchema>) => {
    if (user && parseFloat(data.amount) > parseFloat(user.balance as string)) {
      form.setError("amount", { message: "Insufficient balance" });
      return;
    }
    
    if (parseFloat(data.amount) < MIN_WITHDRAWAL) {
      form.setError("amount", { message: `Minimum withdrawal is ${MIN_WITHDRAWAL} TON` });
      return;
    }

    withdraw({
      amount: data.amount,
      walletAddress: data.walletAddress,
      userId: user?.id || 0,
    }, {
      onSuccess: () => {
        toast({ 
          title: "Withdrawal Requested!", 
          description: "You will receive a notification on Telegram.", 
          className: "bg-green-600 text-white border-none" 
        });
        form.reset();
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  const currentBalance = user?.balance ? parseFloat(user.balance.toString()) : 0;
  const canWithdraw = currentBalance >= MIN_WITHDRAWAL;

  const handleTelegramWalletConnect = () => {
    // In a real Telegram Mini App, we would use window.Telegram.WebApp
    // For this simulation, we'll mimic the professional feel
    const mockAddress = "UQ" + Math.random().toString(36).substring(2, 15).toUpperCase() + Math.random().toString(36).substring(2, 15).toUpperCase();
    form.setValue("walletAddress", mockAddress);
    toast({
      title: "Telegram Wallet Connected",
      description: "Successfully linked your Telegram wallet.",
      className: "bg-blue-600 text-white border-none"
    });
  };

  return (
    <div className="min-h-screen bg-cave-pattern px-4 py-6 pb-24">
      <div className="text-center mb-6">
        <motion.h1 
          className="text-3xl font-black mb-2 gradient-text"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Wallet
        </motion.h1>
        <p className="text-muted-foreground">Withdraw your TON earnings</p>
      </div>

      <div className="mb-6">
        <Button 
          onClick={handleTelegramWalletConnect}
          className="w-full h-14 bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20"
        >
          <img src="https://telegram.org/img/favicon.ico" className="w-6 h-6 rounded-full" alt="Telegram" />
          Connect Telegram Wallet
        </Button>
      </div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-primary/25 to-secondary/10 border-primary/30 mb-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/15 blur-3xl rounded-full" />
          <CardContent className="p-6 flex flex-col items-center justify-center relative z-10">
            <div className="w-16 h-16 ton-coin flex items-center justify-center mb-4 animate-pulse-glow">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <span className="text-sm text-primary font-bold mb-2 uppercase tracking-widest">Current Balance</span>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-5xl font-black font-num text-white tracking-tighter neon-text">
                {currentBalance.toFixed(5)}
              </span>
              <span className="text-xl font-bold text-muted-foreground pb-2">TON</span>
            </div>
            <div className={`flex gap-2 text-xs px-4 py-2 rounded-full border ${canWithdraw ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>
              <AlertCircle className="w-4 h-4" />
              <span>Min withdrawal: {MIN_WITHDRAWAL} TON</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Withdraw Form */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <WalletIcon className="w-5 h-5 text-primary animate-icon-pulse" /> 
          New Withdrawal
        </h3>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="walletAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TON Wallet Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="UQ..." 
                      {...field} 
                      className="bg-card/50 border-white/10 h-12 font-mono text-xs" 
                      data-testid="input-wallet-address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type="number" 
                        step="0.00001" 
                        placeholder="0.00000" 
                        {...field} 
                        className="bg-card/50 border-white/10 h-12 font-num pr-16" 
                        data-testid="input-amount"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">TON</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              disabled={isPending || !canWithdraw}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-xl animate-pulse-glow disabled:animate-none disabled:opacity-50"
              data-testid="button-withdraw"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Confirm Withdrawal
                </>
              )}
            </Button>
          </form>
        </Form>
      </motion.div>

      {/* History */}
      <div>
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-muted-foreground" /> Transaction History
        </h3>
        
        <div className="space-y-3">
          {isLoadingHistory ? (
            <div className="text-center py-4 text-muted-foreground">Loading...</div>
          ) : withdrawals?.length === 0 ? (
            <motion.div 
              className="text-center py-10 bg-card/20 rounded-xl border border-dashed border-white/10 text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No withdrawals yet</p>
            </motion.div>
          ) : (
            withdrawals?.map((w, index) => (
              <motion.div 
                key={w.id} 
                className="flex items-center justify-between p-4 bg-card rounded-xl border border-white/5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-white/5 ${
                    w.status === 'completed' ? 'bg-green-500/20 text-green-500' : 
                    w.status === 'rejected' ? 'bg-red-500/20 text-red-500' : 
                    'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white font-num">{parseFloat(w.amount.toString()).toFixed(5)} TON</div>
                    <div className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">{w.walletAddress}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${
                    w.status === 'completed' ? 'bg-green-500/10 text-green-400' : 
                    w.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {w.status === 'pending' ? 'Pending' : w.status === 'completed' ? 'Completed' : 'Rejected'}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
