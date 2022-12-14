import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WalletEntity } from '../decorators/wallet.decorator';
import { RestAuthGuard } from '../guards/rest-auth.guard';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { Wallet } from '@prisma/client';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordService: PasswordService,
  ) {}

  /* Request a new one time password for your wallet to sign */
  @Get('wallet/request-password/:address')
  async requestPassword(@Param('address') address: string) {
    return await this.passwordService.generateOneTimePassword(address);
  }

  /* Connect your wallet with a signed and encoded one time password */
  @Get('wallet/connect/:address/:encoding')
  async connect(
    @Param('address') address: string,
    @Param('encoding') encoding: string,
  ) {
    return await this.authService.connect(address, encoding);
  }

  /* Refresh your wallets access token */
  @UseGuards(RestAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('wallet/refresh-token/:refreshToken')
  async reauthorize(
    @Param('refreshToken') refreshToken: string,
    @WalletEntity()
    wallet: Wallet,
  ) {
    return await this.authService.refreshAccessToken(wallet, refreshToken);
  }
}
